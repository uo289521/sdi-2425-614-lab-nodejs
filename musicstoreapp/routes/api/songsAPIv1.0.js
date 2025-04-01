const {ObjectId} = require("mongodb");
module.exports = function (app, songsRepository,usersRepository) {
    app.get("/api/v1.0/songs", function (req, res) {
        let filter = {};
        let options = {};
        songsRepository.getSongs(filter, options).then(songs => {
            res.status(200);
            res.send({songs: songs})
        }).catch(error => {
            res.status(500);
            res.json({ error: "Se ha producido un error al recuperar las canciones." })
        });
    });
    app.get("/api/v1.0/songs/:id", function (req, res) {
        try {
            let songId = new ObjectId(req.params.id)
            let filter = {_id: songId};
            let options = {};
            songsRepository.findSong(filter, options).then(song => {
                if (song === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe"})
                } else {
                    res.status(200);
                    res.json({song: song})
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error a recuperar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error :" + e})
        }
    });
    app.put("/api/v1.0/songs/update/:id", function (req,res){
        try {
            let songId = new ObjectId(req.params.id)
            let filter = {_id: songId};
            let options = {};
            songsRepository.findSong(filter, options).then(song => {
                if (song === null) {
                    res.status(404);
                    res.json({error: "ID inválido o no existe"})
                } else {
                    res.status(200);
                    res.json({song: song})
                }
            }).catch(error => {
                res.status(500);
                res.json({error: "Se ha producido un error a recuperar la canción."})
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error :" + e})
        }
    });
    app.delete('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = new ObjectId(req.params.id);
            let filter = {_id: songId};
            console.log(res.user)
            // Buscar la canción
            songsRepository.findSong(filter, {}).then(song => {
                if (song == null) {
                    return res.status(404).json({error: "ID inválido o no existe"});
                }

                // Verificar que el usuario sea el autor
                if (res.user !== song.author) {
                    console.log(song)
                    return res.status(403).json({error: "No se puede eliminar la canción, el autor no es el mismo."});
                }

                songsRepository.deleteSong(filter, {}).then(result => {
                    if (result === null || result.deletedCount === 0) {
                        return res.status(404).json({error: "ID inválido o no existe, no se ha borrado el registro."});
                    } else {
                        return res.status(200).json({message: "Canción eliminada correctamente."});
                    }
                }).catch(error => {
                    return res.status(500).json({error: "Se ha producido un error al eliminar la canción."});
                });

            }).catch(error => {
                // Manejo de error si la canción no se encuentra en la base de datos
                return res.status(500).json({error: "Se ha producido un error al buscar la canción."});
            });

        } catch (e) {
            // Captura de errores generales
            return res.status(500).json({error: "Se ha producido un error, revise que el ID sea válido."});
        }
    });

    app.post('/api/v1.0/songs', function (req, res) {
        try {
            let song = {
                title: req.body.title,
                kind: req.body.kind,
                price: req.body.price,
                author: res.user
            }
            if (!song.title || song.title.length < 5 || song.title.length > 14) {
                if(isNaN(song.price) || song.price <= 0){
                    return res.status(400).json({ error: "El título debe tener entre 5 y 14 caracteres. \n El precio debe ser un número positivo" });
                }
                return res.status(400).json({ error: "El título debe tener entre 5 y 14 caracteres." });
            }

            // Validar precio (debe ser un número positivo)
            if (isNaN(song.price) || song.price <= 0) {
                return res.status(400).json({ error: "El precio debe ser un número positivo." });
            }
            // Validar aquí: título, género, precio y autor.
            songsRepository.insertSong(song, function (songId) {
                if (songId === null) {
                    res.status(409);
                    res.json({error: "No se ha podido crear la canción. El recurso ya existe."});
                } else {
                    res.status(201);
                    res.json({
                        message: "Canción añadida correctamente.",
                        _id: songId
                    })
                }
            });
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar crear la canción: " + e})
        }
    }) ;
    app.put('/api/v1.0/songs/:id', function (req, res) {
        try {
            let songId = new ObjectId(req.params.id);
            let filter = {_id: songId};
            //Si la _id NO no existe, no crea un nuevo documento.
            const options = {upsert: false};
            let song = {
                author: res.user

            }
            if (typeof req.body.title !== "undefined" && req.body.title !== null)
                song.title = req.body.title;
            if (typeof req.body.kind !== "undefined" && req.body.kind !== null)
                song.kind = req.body.kind;
            if (typeof req.body.price !== "undefined" && req.body.price !== null)
                song.price = req.body.price;
            songsRepository.findSong(filter, {}).then(song => {
                if(song.author != res.user){
                    res.status(403);
                    res.json({error: "No se puede modificar la cancion, autor no es ."});
                }else{
                    songsRepository.updateSong(song, filter, options).then(result => {
                        if (result === null) {
                            res.status(404);
                            res.json({error: "ID inválido o no existe, no se ha actualizado la canción."});
                        }

                        else{
                            res.status(200);
                            res.json({
                                message: "Canción modificada correctamente.",
                                result: result
                            })
                        }
                    }).catch(error => {
                        res.status(500);
                        res.json({error : "Se ha producido un error al modificar la canción."})
                    });
                }
            })
        } catch (e) {
            res.status(500);
            res.json({error: "Se ha producido un error al intentar modificar la canción: "+ e})
        }
    });
    app.post('/api/v1.0/users/login', function (req, res) {
        try {
            let securePassword = app.get("crypto").createHmac('sha256', app.get('clave'))
                .update(req.body.password).digest('hex');
            let filter = {
                email: req.body.email,
                password: securePassword
            };
            let options = {};
            usersRepository.findUser(filter, options).then(user => {
                if (user == null) {
                    res.status(401); // Unauthorized
                    res.json({
                        message: "usuario no autorizado",
                        authenticated: false
                    });
                } else {
                    let token = app.get('jwt').sign(
                        { user: user.email, time: Date.now() / 1000 },
                        "secreto"
                    );
                    res.status(200);
                    res.json({
                        message: "usuario autorizado",
                        authenticated: true,
                        token: token
                    });
                }
            }).catch(error => {
                res.status(401);
                res.json({
                    message: "Se ha producido un error al verificar credenciales",
                    authenticated: false
                });
            });
        } catch (e) {
            res.status(500);
            res.json({
                message: "Se ha producido un error al verificar credenciales",
                authenticated: false
            });
        }
    });



}
