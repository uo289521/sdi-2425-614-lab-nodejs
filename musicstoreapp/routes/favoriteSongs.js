const {ObjectId} = require("mongodb");
module.exports = function (app, favoriteSongsRepository) {

        app.post('/songs/favorite/add/:id', function (req, res) {
            console.log("hola")
            let song = {
                song_id: req.params.id,
                date: Date.now(),
                price: req.body.price,
                title: req.body.title,
                user: req.session.user
            };
            let filter = { _id: new ObjectId(song.song_id) };

            const options = { upsert: true };

            favoriteSongsRepository.insertFavoriteSong(song).then(userId => {
                res.send('Favorita Registrada ' + userId);
            }).catch(error => {
                res.send("Error al insertar el usuario");
            });
        });

        app.get('/songs/favorites', function (req, res){
            let filter =

                {user : req.session.user};
            let options = {sort: {title: 1}};
            favoriteSongsRepository.getFavoriteSongs(filter, options).then(songs => {
                let totalPrice = songs.reduce((total, song) => total + parseFloat(song.price || 0), 0);

                res.render("favorites.twig", { songs: songs, totalPrice: totalPrice });
            }).catch(error => {
                res.send("Se ha producido un error al listar las publicaciones del usuario:" + error)
            });
        });

        app.get('/songs/favorite/delete/:id', function (req,res){
            const songId = req.params.id; // Obtener el ID de la canción desde la URL
            // Formato commit
            favoriteSongsRepository.deleteFavoriteSong(new ObjectId(songId)).then(p => {
                res.redirect("/shop");
            }).catch( error => {
                res.send("Se ha producido un error al listar las publicaciones del usuario:" )
            });
            });


}