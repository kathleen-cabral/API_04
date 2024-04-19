//17/04 VAMOS CRIAR DOIS NOVOS ENDPOINTS 
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

//imports
const mysql_config = require('./imp/mysql_config');
const functions = require('./imp/functions');

//variaveis para disponibilidades e para versionamento
const API_AVAILABILITY = true;
const API_VERSION = '1.0.0';

//iniciar servidor 
const app =  express();
app.listen(3000,()=>{
    console.log("API esta executando");
})

//verificar a disponibilidade da API
app.use((req,res,next)=>{
    if(API_AVAILABILITY){
        next()
    }
    else {
        res.json(functions.response('Atenção','API está em manutenção. Sorry!',0,null));
    }
})

//conexão com mysql
const connection = mysql.createConnection(mysql_config);

//inserindo o tratamento do params-------------------------------------------------------------------------

app.use(express.json());

app.use(express.urlencoded({extended:true}));

//----------------------------------------------------------------------------------------------------------

//cors
app.use(cors());

//rotas
//rota inicial
app.get('/',(req,res)=>{
    res.json(functions.response("sucesso","API está rodando",0,null));
})

//endpoint
//rota 
app.get('/tasks',(req,res)=>{
    connection.query('SELECT * FROM tasks',(err,rows)=>{
        if(!err){
            res.json(functions.response('Sucesso','Sucesso na consulta',rows.length,rows))
        }
        else{
            res.json(functions.response('erro',err.message,0,null))
        }
    })
})

//rota para fazer uma consulta de tarefas por id

app.get('/tasks/:id',(req,res)=>{
    const id= req.params.id;
    connection.query('SELECT * FROM tasks WHERE id = ?',[id],(err,rows)=>{
        if(!err){
            if(rows.length>0){
                res.json(functions.response('Sucesso','Sucesso na pesquisa',rows.length,rows))
            }
            else{
                res.json(functions.response('Atenção','Não foi encontrada a task selecionada',0,null))
            }
        }
        else{
            res.json(functions.response('erro',err.message,0,null))
        }
    })
})

//rota para atualizar status da task pelo id selecionado
app.put('/tasks/:id/status/:status',(req,res)=>{
    const id= req.params.id;
    const status= req.params.status;
    connection.query('UPDATE tasks SET status = ? WHERE id = ?',[status,id],(err,rows)=>{
        if(!err){
            if(rows.affectedRows>0){
                res.json(functions.response('Sucesso','Sucesso na alteração do status', rows.affectedRows,null))
            }
            else{
                res.json(functions.response('Alerta vermelho','Task não encontrada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//rota para excluir uma task
app.delete('/tasks/:id/delete',(req,res)=>{
    const id = req.params.id;
    connection.query('DELETE FROM tasks WHERE id = ?',[id],(err,rows)=>{
        if(!err){
            if(rows.affectedRows>0){
                res.json(functions.response('Sucesso','Task deletada',rows.affectedRows,null))
            }
            else{
                res.json(functions.response('Atenção','Task não encontrada',0,null))
            }
        }
        else{
            res.json(functions.response('Erro',err.message,0,null))
        }
    })
})

//endpoint para inserir uma nova task
app.post('/tasks/create',(req,res)=>{
    ///como a task é um texto e o status tambem
    //atraves da rota adicionar midlewarepara isso
    const post_data = req.body;

    if(post_data == undefined){
        res.json(functions.response('Atenção','Sem dados de uma nova tasks',0,null));
        return
    }
    //checagem se os dados informados são inválidos
    if(post_data.task==undefined || post_data.status==undefined){
        res.json(functions.response('Atenção','Dados inválidos',0,null));
        return
    }

    //pegar dos dados da task
    const task = post_data.task;
    const status = post_data.status;

    //inserir a task 
    connection.query('INSERT INTO tasks (task,status,created_at,update_at) VALUES (?,?,NOW(),NOW())',[task,status],(err,rows)=>{
        if(!err){
            res.json(functions.response('Sucesso','Tasks cadastrada com sucesso',rows.affectedRows,null));
        }
        else {
            res.json(functions.response('Erro',err.message,0,null));
        }
    })
})


//tratar erro de rota
app.use((req,res)=>{
    res.json(functions.response('atenção','rota não encontrada',0,null));
})