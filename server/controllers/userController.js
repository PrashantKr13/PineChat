const User = require("../models/userModel");
const bcrypt = require("bcrypt");

module.exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const usernameCheck = await User.findOne({ username });
        if (usernameCheck) {
            return res.json({ msg: "Username already present.", status: false });
        }
        const emailCheck = await User.findOne({ email });
        if (emailCheck) {
            return res.json({ msg: "Email already in use.", status: false });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            username, email, password: hashedPassword
        });
        delete User.password;
        return res.json({ status: true, newUser });
    } catch (error) {
        next(error);
    }
}

module.exports.login = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({username});
        if(!user){
            return res.json({msg: "User not found.", status: false});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.json({msg: "Incorrect password.", status: false});
        }
        delete user.password;
        return res.json({status: true, user});
    } catch (error) {
        next(error);
    }
}

module.exports.setAvatar = async (req, res, next) => {
    try {
        const userId = req.params.id;
        const avatarImage = req.body.image;
        const userData = await User.findByIdAndUpdate(userId, {
            isAvatarImageSet: true,
            avatarImage: avatarImage,
        },{new: true});
        res.json({isSet: userData.isAvatarImageSet, image: userData.avatarImage});
    } catch (error) {
        next(error)
    }
}

module.exports.getAllUser = async (req, res, next) => {
    try {
        const users = await User.find({_id:{$ne: req.params.id}}).select([
            "email", "username", "avatarImage", "_id"
        ]);
        return res.json(users);
    } catch (error) {
        next(error);
    }
}