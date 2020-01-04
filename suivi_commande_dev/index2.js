const mysql = require('mysql')

const mySqlClient = mysql.createConnection({
  host     : "mysql.commande",
  user     : "command_lbs",
  password : "command_lbs",
  database : "command_lbs"
});
let hasOwnProperty = Object.prototype.hasOwnProperty;
function is_empty(obj) {

  // null and undefined are empty
  if (obj == null) return true;
  // Assume if it has a length property with a non-zero value
  // that that property is correct.
  if (obj.length && obj.length > 0)    return false;
  if (obj.length === 0)  return true;

  for (var key in obj) {
      if (hasOwnProperty.call(obj, key))    return false;
  }

  return true;
}

const express = require('express')
const app = express()
const body_parser = require('body-parser')
app.use(body_parser.json())

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
})


app.get('/', function (req, res) {
  res.json({hello:"Hello World!"})
})


function query (page,status,size,res) {
  
  //condition pour savoir si il n'y a pas de paramettre dans l'url 
  if (page == null && status == null && size == null){
    let selectQuery = 'SELECT * FROM commande ORDER BY date_commande;';
    mySqlClient.query(selectQuery,function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          res.send({type:"collection",count:result1[0].count,  commands: result}) 
        }
      })
    }
    });
  }
  // condition pour savoir si le paramettre size est present dans l'url
  else if (page == null && status == null && size != null){
    let selectQuery = 'SELECT * FROM commande ORDER BY date_commande LIMIT '+size+';';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          res.send({type:"collection",size:parseInt(size),count:result1[0].count,   links :{
            next:
              {
                href:"/commandes/?size="+size
              },
            prev:
            {
              href:"/commandes/?size="+size
            },
            last:
            {
              href:"/commandes/?size="+size
            },
            first:
            {
              href:"/commandes/?&size="+size
            },
          },  commands: result}) 
        }
      })
    }
    });

  }
  //condition pour savoir si la parammettre status est present dans l'url
  else if (page == null && status != null && size == null){
    let selectQuery = 'SELECT * FROM commande WHERE status='+status+' ORDER BY date_commande;';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          res.send({type:"collection",status:parseInt(status),count:result1[0].count,    links :{
            next:
              {
                href:"/commandes/?status="+status
              },
            prev:
            {
              href:"/commandes/?status="+status
            },
            last:
            {
              href:"/commandes/?status="+status
            },
            first:
            {
              href:"/commandes/?status="+status
            },
          },  commands: result}) 
        }
      })    
    }
    });

  }
  //condition pour savoir si le paramettre page est present dans l'url
  else if (page != null && status == null && size == null){
    let limit_deb = (page-1)*10
    let limit_fin = page*10
    let selectQuery = 'SELECT * FROM commande ORDER BY date_commande LIMIT '+limit_deb+','+limit_fin+';';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      if(result.length != 0){
        let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
        mySqlClient.query(selectQuery,function (err, result1) {
          if (err){
            res.send({type:"error",error:500,message : 'Erreur interne'})
          }else{
            let page_max = result1[0].count/10
            let prev_page=0

            if(!Number.isInteger(page_max)){
              page_max = Math.floor(page_max)+1
            }

            if(parseInt(page)==1){
              prev_page = 1
            }else{
              prev_page = parseInt(page)-1
            }
            res.send({type:"collection",page:parseInt(page),count:result1[0].count,   links :{
              next:
                {
                  href:"/commandes/?page="+(parseInt(page)+1)
                },
              prev:
              {
                href:"/commandes/?page="+prev_page
              },
              last:
              {
                href:"/commandes/?page="+page_max
              },
              first:
              {
                href:"/commandes/?page=1"
              },
            },  commands: result}) 
          }
        })     
       }else{
        res.send({type:"error",error:404,message : 'Ces pages sont vide veuillez diminuer la pagination'})

      }
    }
    });

  }
  //condition pour savoir si tous les paramettre son present dans l'url : status ,paage, size
  else if (page != null && status != null && size != null){
    let limit_deb = (page-1)*10
    let limit_fin = size
    let selectQuery = 'SELECT * FROM commande WHERE status='+status+' ORDER BY date_commande LIMIT '+limit_deb+','+limit_fin+';';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          let page_max = (result1[0].count)/(size)
          console.log(page_max)
          let prev_page
          if(!Number.isInteger(page_max)){
            page_max = Math.floor(page_max)+1
          }
          if(parseInt(page)==1){
            prev_page = 1
          }else{
            prev_page = parseInt(page)-1
          }
          res.send({
            type:"collection",
            size:parseInt(size),
            page:parseInt(page),
            status:parseInt(status),
            count:result1[0].count,
            links :{
              next:
                {
                  href:"/commandes/?page="+parseInt(page+1)+"&size="+size+"&status="+status
                },
              prev:
              {
                href:"/commandes/?page="+prev_page+"&size="+size+"&status="+status
              },
              last:
              {
                href:"/commandes/?page="+page_max+"&size="+size+"&status="+status
              },
              first:
              {
                href:"/commandes/?page=1&size="+size+"&status="+status
              },
            }, 
            commands: result
          }) 
        }
      })
    }
    });

  }
  //----------------------------------------------------------------------------------
  //condition pour savoir si tous les paramettre son present dans l'url : status ,paage
  else if (page != null && status != null && size == null){
    let limit_deb = (page-1)*10
    let limit_fin = page*10
    let selectQuery = 'SELECT * FROM commande WHERE status='+status+' ORDER BY date_commande LIMIT '+limit_deb+','+limit_fin+';';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          let page_max =result1[0].count/10.
          let prev_page = 0
          if(!Number.isInteger(page_max)){
            page_max = Math.floor(page_max)+1
          }
          if(parseInt(page)==1){
            prev_page = 1
          }else{
            prev_page = (parseInt(page)-1)
          }
          res.send({type:"collection",page:parseInt(page),status:parseInt(status),count:result1[0].count,links :{
            next:
              {
                href:"/commandes/?page="+(parseInt(page)+1)+"&status="+status
              },
            prev:
            {
              href:"/commandes/?page="+prev_page+"&status="+status
            },
            last:
            {
              href:"/commandes/?page="+page_max+"&status="+status
            },
            first:
            {
              href:"/commandes/?page=1&status="+status
            },
          },  commands: result}) 
        }
      })    
    }
    });

  }
//--------------------------------------------------------------------------------------------


  //-------------------------------------------------------------------------------
  //condition pour savoir si tous les paramettre son present dans l'url : size ,paage
  else if (page != null && status == null && size != null){
    let limit_deb = (page-1)*10
    let limit_fin = size
    let selectQuery = 'SELECT * FROM commande ORDER BY date_commande LIMIT '+limit_deb+','+limit_fin+';';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          let page_max =result1[0].count/10.
          let prev_page = 0
          if(!Number.isInteger(page_max)){
            page_max = Math.floor(page_max)+1
          }
          if(parseInt(page)==1){
            prev_page = 1
          }else{
            prev_page = (parseInt(page)-1)
          }
          res.send({type:"collection",size:parseInt(size),page:parseInt(page),count:result1[0].count,links :{
            next:
              {
                href:"/commandes/?page="+(parseInt(page)+1)+"&size="+size
              },
            prev:
            {
              href:"/commandes/?page="+prev_page+"&size="+size
            },
            last:
            {
              href:"/commandes/?page="+page_max+"&size="+size
            },
            first:
            {
              href:"/commandes/?page=1&size="+size
            },
          },  commands: result}) 
        }
      })  
    }
    });
  }
  //-----------------------------------------------------------------------------------



  //condition pour savoir si tous les paramettre son present dans l'url : size ,status
  else if (page == null && status != null && size != null){
    let limit = size
    let selectQuery = 'SELECT * FROM commande WHERE status='+status+' ORDER BY date_commande LIMIT '+limit+';';
    mySqlClient.query(selectQuery, function (err, result) {
    if (err){
      res.send({type:"error",error:500,message : 'Erreur interne'})
    }else{
      let selectQuery = 'SELECT count(*) as count FROM commande ORDER BY date_commande;';
      mySqlClient.query(selectQuery,function (err, result1) {
        if (err){
          res.send({type:"error",error:500,message : 'Erreur interne'})
        }else{
          res.send({type:"collection",size:parsInt(size),status:parseInt(status),count:result1[0].count,links :{
            next:
              {
                href:"/commandes/?size="+size+"&status="+status
              },
            prev:
            {
              href:"/commandes/?size="+size+"&status="+status
            },
            last:
            {
              href:"/commandes/?size="+size+"&status="+status
            },
            first:
            {
              href:"/commandes/?status="+status
            },
          },  commands: result}) 
        }
      })  
    }
    });

  }
  else{
    return "je ne sais pas comment vous etez arriver la "
  }
}

app.get('/:command', function (req, res) { 
  let uri  = new URL(req.protocol+req.get('host')+req.originalUrl)
  let params =  uri.searchParams.toString().split('&')
  let longueur_params = params.length
  if(req.params.command != "commandes"){
    res.send({type:"error",error:400,message : 'Route non connu '})
  }else{
    let result1 = query(uri.searchParams.get('page'),uri.searchParams.get('s'),uri.searchParams.get('size'),res);
    console.log(result1)
    
}

})
