module.exports = function(app,twig) {
    app.get("/authors/add", function(req,res) {
        var lista = [
            {
                "name": "Cantante",
                "value": "cantante"
            },
            {
                "name": "Batería",
                "value": "batería"
            },
            {
                "name": "Guitarrista",
                "value": "guitarrista"
            },
            {
                "name": "Bajista",
                "value": "bajista"
            },
            {
                "name": "Pianista",
                "value": "pianista"
            }
        ];
        var list = {
            rols: lista
        }
        res.render("authors/add.twig", list);
    });


    app.get("/authors" , function(req,res){
        const lista = [{
            "title": "Pepe",
            "group": "Red hot chilli peppers",
            "role": "cantante"
        }, {
            "title": "Juan",
            "group": "El grupo guitarra",
            "role": "guitarrista"
        }, {
            "title": "Casemiro",
            "group": "Real madrid",
            "role": "cantante"
        }];

        const response = {
            seller: "Autores",
            authors: lista
        };
        res.render("authors/authors.twig", response);
    });



    app.post("/authors/add", function (req,res){
        let response = "Cantante se llama";

        if(req.body.title != null && typeof(req.body.title) != "undefined" && req.body.title.trim() !== ""){
            response += req.body.title;
        }else{
            response += "parametro no enviado"
        }

        if(req.body.grupo != null && typeof(req.body.grupo) != "undefined" && req.body.grupo.trim() !== ""){
            response+= " <br> esta en el grupo "+ req.body.grupo;
        }else{
            response += "parametro no enviado"
        }



        response+=  " <br> es del rol "  + req.body.rol;


        res.send(response);
    });

    app.get("/authors*", function (req,res){
        res.redirect("/authors")

    }
    );

};