const {User} = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
    Query:{
        me: async (parent, args, context) => {
            if (context.user) {
                return User.findOne({_id: context.user._id});
            }
            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent, {username, email, password})=>{
            const user = await User.create({username, email, password});
            const token = signToken(user);

            return {token, user};
        },
        loginUser: async (parent, {email, password})=>{
            const user = await User.findOne({email});
            console.log("user", user);
            if (!user) {
                throw AuthenticationError;
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw AuthenticationError;
            }

            const token = signToken(user);
            console.log("this is token before return:", token)
            return {token, user};
        },
        saveBook: async (parent, args, context)=>{
            console.log(args);
            console.log("this is context", context.user)
            if(context.user){
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks:{...args}}},
                    { new: true }
                )
            }
            throw AuthenticationError;
        },
        removeBook: async (parent, {bookId}, context)=>{
            if(context.user){
                return User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: {bookId:bookId} },
                    { new: true }
                );
            }
            throw AuthenticationError;
        }
    }
};

module.exports = resolvers;