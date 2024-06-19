const User = require("../models/user")

exports.getUsers = async (req, res, next) => {
    let users = await User.find()
    res.status(200).json({
        success: true,
        results: users.length,
        data: users
    })
}

exports.createNewUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
        return res.status(400).json({ success: false, message: 'User already exists' });
    }

    // Create new user
    user = await User.create({
        name,
        email,
        password,
    });

    res.status(201).json({ success: true, message: 'User created', data: user });
}

exports.updateUser = async (req, res, next) => {
    const { name, password } = req.body;
    const newEmail = req.body.email
    const email = req.params.email;
    try {
        // Check if the user exists
         
        let user = await User.findOne({ email });
        if (user) {
            // Update user information
            user.name = name || user.name; // Update name if provided, otherwise keep the existing name
            user.email = newEmail || user.email; // Update email if provided, otherwise keep the existing email
            user.password = password || user.password; // Update password if provided, otherwise keep the existing password

            await user.save();

            return res.status(200).json({ success: true, message: 'User updated', data: user });
        } 
        return res.status(201).json({ success: true, message: 'No user found', data: user });
    } catch (error) {
        console.error('Error editing user:', error);
        return res.status(500).json({ success: false, message: error });
    }
};

exports.getUserBySlug = async (req, res, next) => {
    const { email, slug } = req.params;
    console.log(email + ' ' + slug);
    try {
        var users = await User.findOne({email, slug});

        if (!users || users.length === 0) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.status(200).json({ success: true, data: users });
    } catch (error) {
        console.error('Error finding user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

exports.deleteUser = async (req, res, next) => {
    const { email } = req.params;
    try {
        var user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        user = await User.findOneAndDelete({ email })
        res.status(200).json({ success: true, message: 'User deleted', data: user });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};