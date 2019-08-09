const axios = require('axios');
const Dev = require('../models/Dev');

module.exports = {

    async index(req, res){
        const { user } = req.headers;

        const loggedDev = await Dev.findById(user);

        const users = await Dev.find({
            $and: [ // pegar todos os devs, ignorando
                { _id: { $ne: user } }, // meu usuário
                { _id: {$nin: loggedDev.likes}}, // não estão na minha lista de likes
                { _id: {$nin: loggedDev.dislikes}} // não estão na minha lista de dislikes 
            ],
        })

        return res.json(users);
    },

    async store(req, res){

        const {username} = req.body;

        // analisar se usuário já existe
        const userExists = await Dev.findOne({ user: username});

        if(userExists){
            // se usuário já existente, não cadastrá-lo novamente
            return res.json(userExists);
        }

        const response = await axios.get(`https://api.github.com/users/${username}`);

        const { name, bio, avatar_url: avatar} = response.data;
       
        const dev = await Dev.create({
            name,
            user: username,
            bio,
            avatar
        })

        return res.json(dev)
    }
};
