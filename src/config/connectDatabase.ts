import mongoose from 'mongoose';

function isString(value: any): value is string {
    return typeof value === 'string';
}

const connectDatabaseMongo = () => {
    const uri = process.env.MONGO_URI ; 

    try {

        if (isString(uri)) {

            if (!isString(uri)) {
                throw new Error('Erreur : uri n\'est pas de type string');
            }
    
            if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
                throw new Error('Invalid MongoDB connection string. It should start with "mongodb://" or "mongodb+srv://"');
            }
            
            mongoose.connect(uri);
            console.log('Connexion à la base de données MongoDB réussie');
        } else {
            console.error('Erreur : uri n\'est pas de type string');
        }
        console.log('Connexion à la base de données MongoDB réussie');
    } catch (error) {
        console.error('Erreur lors de la connexion à la base de données MongoDB', error);
    }

}

export default connectDatabaseMongo;