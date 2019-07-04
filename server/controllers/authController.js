const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const settings = require('../common/settings');

exports.registration = async (req, res, next) => {
    try {
        const {  username, email, password } = req.body;

        errors = null;

        if (!username) {
            errors = { username: 'State is empty' };
        }

        if (!email) {
            if (errors) {
                errors.email = 'Email is empty';
            } else {
                errors = { email: 'Email is empty' };
            }
        } else if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.toLowerCase())) {
            if (errors) {
                errors.email = 'Email is invalid';
            } else {
                errors = { email: 'Email is invalid' };
            }
        }

        if (!password) {
            if (errors) {
                errors.password = 'Password is empty';
            } else {
                errors = { password: 'Password is empty' };
            }
        } else if (password.length < 6) {
            if (errors) {
                errors.password = 'Too short password (min 6 signs)';
            } else {
                errors = { password: 'Too short password (min 6 signs)' };
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        if (await User.findOne({ where: { email } })) {
            return res.status(401).send({ message: '{\"email\": \"This email has already existed\"}' });
        }
        const passwordHashed = await bcrypt.hash(password, 12);

        const userCount = await User.findAll();

        const admin = userCount.length === 0;

        const user = await User.create({
            email,
            password: passwordHashed,
            username,
            admin
        });
        const token = await createUserToken(user);

        res.status(200).send({
            token,
            id: user.id,
            username: user.username,
            admin: user.admin,
            email: user.email
        });
    } catch (err) {
        res.status(400).send({ message: JSON.stringify({common: err.toString()}) });
    }
}

exports.signin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        errors = null;

        if (!email) {
            errors = { email: 'Email is empty' };
        } else if (!/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.toLowerCase())) {
            errors = { email: 'Email is invalid' };
        }

        if (!password) {
            if (errors) {
                errors.password = 'Password is empty';
            } else {
                errors = { password: 'Password is empty' };
            }
        }

        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            if (errors) {
                errors.common = 'Email or password not valid';
            } else {
                errors = { common: 'Email or password not valid' };
            }
        } else {
            const isEqual = await bcrypt.compare(password, user.password);
            if (!isEqual) {
                if (errors) {
                    errors.common = 'Email or password not valid';
                } else {
                    errors = { common: 'Email or password not valid' };
                }
            }
        }
        if (errors) {
            return res.status(404).send({ message: JSON.stringify(errors) });
        }

        const token = await createUserToken(user);

        res.status(200).send({
            token,
            id: user.id,
            username: user.username,
            admin: user.admin,
            email: user.email
        });
    } catch (err) {
        res.status(400).send({ message: err.toString() });
    }
}

const createUserToken = async (user) => {
    const token = jwt.sign(
        {
            userId: user.id.toString(),
            email: user.email,
        },
        settings.JWT_SECRET_WORD,
        { expiresIn: '30d' },
    );

    return token;
}
