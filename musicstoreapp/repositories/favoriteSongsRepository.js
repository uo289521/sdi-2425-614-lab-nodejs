module.exports = {
    mongoClient: null,
    app: null,
    database: "musicStore",
    collectionName: "favorite_songs",
    init: function (app, dbClient) {
        this.dbClient = dbClient;
        this.app = app;
    },
    getFavoriteSongs: async function (filter, options) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const songs = await songsCollection.find(filter, options).toArray();
            return songs;
        } catch (error) {
            throw (error);
        }
    }, insertFavoriteSong: async function (song) {
        try{
            await  this.dbClient.connect()
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);
            const insert = await songsCollection.insertOne(song);
            return insert.insertedId;
        }catch (error) {
            throw (error);
        }

    },
    deleteFavoriteSong: async function (songId) {
        try {
            await this.dbClient.connect();
            const database = this.dbClient.db(this.database);
            const songsCollection = database.collection(this.collectionName);

            // Eliminar la canción por su _id
            const result = await songsCollection.deleteOne({ _id: songId });

            if (result.deletedCount === 1) {
                return { success: true };
            } else {
                return { success: false, message: "No se encontró la canción a eliminar." };
            }
        } catch (error) {
            throw (error);
        }
    }
};