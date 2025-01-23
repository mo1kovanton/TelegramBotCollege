const ExcelJS = require('exceljs');

async function xlsxFileHandler(buffer) {
    const workbook = new ExcelJS.Workbook();
    try {
        await workbook.xlsx.load(buffer);
        const worksheet = workbook.worksheets[0]; 
      
        if(worksheet.rowCount === 0){
            return {success : false }; 
        }

        const data = [];

        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { 
                const rowData = row.values.slice(1);  
                data.push(rowData);
            }
        });

        return { success: true, data};
    } catch (err) {
        return { success: false };
    }
}

module.exports = {
    xlsxFileHandler
};
