var express = require("express");
let userModel = require("../schemas/users");
let Excel = require('exceljs');
let passwordHandler = require('../utils/passwordHandler');
let mailHandler = require('../utils/mailHandler');

module.exports = {
    CreateAnUser: async function (username, password,
        email, role, fullName, avatarUrl, status, session
    ) {
        let newItem = new userModel({
            username: username,
            password: password,
            email: email,
            role: role,
            fullName: fullName,
            avatarUrl: avatarUrl,
            status: status

        });
        await newItem.save({ session });
        return newItem;
    },
    importUsersFromExcel: async function (filePath, defaultRoleId) {
        let workbook = new Excel.Workbook();
        await workbook.xlsx.readFile(filePath);
        let worksheet = workbook.getWorksheet(1);
        let results = { success: 0, failed: 0, errors: [] };

        // Start from row 2 (skipping header)
        for (let i = 2; i <= worksheet.rowCount; i++) {
            let row = worksheet.getRow(i);
            
            // Helper function to extract value from cell (handles formulas, objects, etc.)
            const getCellValue = (cell) => {
                if (cell.value && typeof cell.value === 'object') {
                    return cell.value.result || cell.value.text || cell.text || "";
                }
                return cell.value || "";
            };

            let username = getCellValue(row.getCell(1));
            let email = getCellValue(row.getCell(2));

            if (!username || !email) continue;

            // Helper for delay
            const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

            try {
                // Generate random password
                let rawPassword = passwordHandler.generateRandomPassword(16);

                // Create user
                await this.CreateAnUser(
                    username,
                    rawPassword,
                    email,
                    defaultRoleId,
                    "", "", true // status active
                );

                // Print to console as backup if Mailtrap fails
                console.log(`[Import Success] User: ${username} | Email: ${email} | Password: ${rawPassword}`);

                // Send Email with 4s delay to strictly avoid Mailtrap rate limits
                await sleep(4000); 
                await mailHandler.sendCredentialMail(email, username, rawPassword);
                
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push({ row: i, username, error: error.message });
                console.error(`Error processing row ${i}: ${error.message}`);
            }
        }
        return results;
    },
    FindByID: async function (id) {
        return await userModel
            .findOne({
                _id: id,
                isDeleted: false
            }).populate({
                path: 'role', select: 'name'
            });
    },
    FindByUsername: async function (username) {
        return await userModel.findOne(
            {
                username: username,
                isDeleted: false
            }
        )
    }, FindByEmail: async function (email) {
        return await userModel.findOne(
            {
                email: email,
                isDeleted: false
            }
        )
    },
    FindByToken: async function (token) {
        let user = await userModel.findOne(
            {
                forgotPasswordToken: token,
                isDeleted: false
            }
        )
        if (user && user.forgotPasswordTokenExp > Date.now()) {
            return user;
        }
        return undefined
    },
    getAllUser: async function () {
        let users = await userModel
            .find({ isDeleted: false }).
            populate({ path: 'role', select: 'name' })
        return users;
    }
}