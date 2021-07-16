const workspaceModel = require("../models/workspaceModel");
const {validationResult} = require('express-validator');
//const http = require('http')
const exportFromJSON = require('export-from-json')

exports.renderSettings = async (req,res) =>{

    const { idWorkspace } = req.params;
    console.log("console de id render", idWorkspace);
    const workSpace = await workspaceModel.findById(idWorkspace);
    const settings = workSpace.settings;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    res.render("settings", {
      idWorkspace,
      settings
    });
  }
  
exports.updateSettings = async (req,res) =>{

  //Validación de errores de express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let {idWorkspace, hideCompletedTask} = req.body;
    let body = req.body;
    console.log("ese es el console de la url dinamica", idWorkspace);
    console.log("*****BODY****", body);
    console.log("console de hidecompleted tasks", hideCompletedTask);

    const workspace = await workspaceModel.findById(idWorkspace);
    console.log(workspace);
    workspace.settings.hideCompletedTask = hideCompletedTask;
    await workspace.save();
    console.log("actualizado", workspace); 
  }

  exports.exportTasks = async (req, response) =>{
    const  idWorkspace = req.query.idWorkspace; //Recuperamos el id del workSapace
    const exportType = req.query.exportTasks;   //Recuperamos del req mediante query tipo de fotmato solicitado
    console.log("valor de idWorkspace----------->",idWorkspace);
    console.log("Tipo de exportación------------>",exportType);
    const allTasks = await workspaceModel.getAllTasks(idWorkspace); //Recuperamos todas las TAREAS de este workSpace en formA de ARRAY DE OBJETOS (BSONS, son los objetos que utiliza MongoDb)
    console.log("El worspace solicitado a la BBDD:",allTasks);
     //Si exportType es 'json', los datos pueden ser cualquier JSON parseable. Si exportType es 'csv' o 'xls', los datos solo pueden ser una matriz de JSON parseable. Si exportType es 'txt', 'css', 'html', los datos deben ser un tipo de cadena.
    let data; //Declaramos data parea condicionarla posteriormente...
    if (exportType == 'csv' || 'xls' ){
    data = allTasks;

    }else if(exportType == 'json'){
    data  = JSON.stringify(allTasks);
    //data = JSON.parse(box)

    }else{
    data = JSON.stringify(allTasks);   
      }
    console.log("data:*-*-*-*-*-*-*-*->",data)

      // exportFromJSON actually supports passing JSON as the data option. It's very common that reading it from http request directly.
    const fileName = 'workSpaceFromMongoDb'
    const result = await exportFromJSON({
        data,
        fileName,
        exportType,
        processor (content, type, fileName) {
            switch (type) {
                case 'txt':
                    console.log("estamos en .txt", content,type, fileName); //OUT: estamos en .txt txt txt workSpaceFromMongoDb.txt
                    response.setHeader('Content-Type', 'text/plain')
                    break
                case 'css':
                    console.log("estamos en .css", content,type, fileName); //OUT: estamos en .css css css workSpaceFromMongoDb.css
                    response.setHeader('Content-Type', 'text/css')
                    break
                case 'html':
                    console.log("estamos en .html",type);
                    response.setHeader('Content-Type', 'text/html')
                    break
                case 'json':
                    response.setHeader('Content-Type', 'text/plain')
                    break
                case 'csv':
                    response.setHeader('Content-Type', 'text/csv')
                    break
                case 'xls':
                    response.setHeader('Content-Type', 'application/vnd.ms-excel')
                    break
            }
            response.setHeader('Content-disposition', 'attachment;filename=' + fileName)
            return content
        }
    })

    response.write(result)
    response.end()

  }


