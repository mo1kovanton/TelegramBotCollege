const { createConversation , conversations } = require('@grammyjs/conversations');
const { xlsxFileHandler } = require('../utilities/xlsxFile');
const axios = require('axios');

module.exports = (bot) => {
    bot.use(conversations());
   
    async function student(conversation,ctx) {
        await ctx.reply('Вы выбрали команду для анализа успеваемости студента. Пришлите мне файл с расширением .xlsx для обработки данных.'); 
        const userResponse = await conversation.wait(); 

        if (userResponse.message.document){
            await ctx.reply('Ваш файл получен, начинаю проверку расширения.'); 
            const file = userResponse.message.document; 
            const fileType = file.mime_type;

            if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'){
                await ctx.reply('Данное расширение поддерживается , начинается обработка данных , ожидайте.');
                
                try{ 
                    const fileInformation = await bot.api.getFile(file.file_id);
                    const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${fileInformation.file_path}`;  
                    const request = await axios.get(fileUrl, { responseType: 'arraybuffer' });
                    const result = await xlsxFileHandler(request.data);

                    if (result.success) {
                        message(ctx,result.data);
                        return;  
                    } else {
                        console.log('Ошибка обработки данных.');
                        await ctx.reply('Ваш файл пустой.')
                        return; 
                    }
                }catch(err){
                   await ctx.reply('Во время обработки данных произошла ошибка.');
                   return; 
                }
            }else{
                await ctx.reply('Вам необоходимо повторить запрос , данное расширение файла не поддерживается.');
                return; 
            }
        }else{
            await ctx.reply('Я вас не понимаю , повторите свой запрос , выбрав команду из \"Меню\".');
            return; 
        }
    }
    
    async function message(ctx,data){
        let message = 'Успеваемость студента:\n'; 
        
        const columns = {
            studentFIO : 0,
            homework : 15,
            classwork : 16, 
            exams : 17,
        }; 

        data.forEach(row => {
          const studentFIO = row[columns.studentFIO]; 
          const homework = row [columns.homework]; 
          const classwork = row[columns.classwork]; 
          const exams = row[columns.exams];  

          if(isFinite(homework) && isFinite(classwork) && isFinite(exams)){
            const averageMark = ((homework + classwork + exams) / 3).toFixed(2);
            
            if (averageMark < 3){
              message+=`Студент - ${studentFIO}\n`;
              message+=`Средняя оценка - ${averageMark}\n`;
              message+=`\n`;
            }

          }else{
            message+=`Студент - ${studentFIO}\n`;
            message+=`Ошибка в данных , проверьте поля таблицы.\n`;
            message+=`\n`;
          }
       }); 
        await ctx.reply(message); 
    }

    bot.use(createConversation(student));

    bot.command('student' , async(ctx)=>{
        await ctx.conversation.enter('student');
    })
};
