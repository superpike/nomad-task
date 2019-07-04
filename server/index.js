const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');

const authRoutes = require('./routes/authRoutes');
const statusRoutes = require('./routes/statusRoutes');
const taskRoutes = require('./routes/taskRoutes');
const commentRoutes = require('./routes/commentRoutes');

const sequelize = require('./common/database');
const User = require('./models/user');
const Status = require('./models/status');
const Task = require('./models/task');
const TaskUser = require('./models/taskUser');
const Comment = require('./models/comment');

const settings = require('./common/settings');

const { statuses } = require('./seedDB');

app.use(bodyParser.json());
app.use(cors());

app.use('', authRoutes);

//check token
app.use('', async (req, res, next) => {
    try {
        const authHeader = req.get("Authorization");
        if (!authHeader || authHeader.split(" ")[0].toLowerCase() !== "bearer") {
            throw {
                statusCode: 403,
                message: 'No valid token',
                data: []
            };
        }
        const token = authHeader.split(" ")[1];

        const user = await User.findByToken(token);
        if (!user) {
            throw {
                statusCode: 403,
                message: 'No valid token',
                data: []
            };
        }
        req.user = user;
        next();

    } catch (err) { next(err) }
});

app.use('', statusRoutes);
app.use('', taskRoutes);
app.use('', commentRoutes);

app.use('', async (req, res, next) => {
    try {
        return res.status(404).send({ message: 'Wrong path' });
    } catch (err) {
        return res.status(404).send({ message: 'Wrong path' });
    }
});

app.use((error, req, res, next) => {
    const { statusCode: status, message, data } = error;
    res.status(status || 500).json({ message, data });
});

Task.belongsTo(Status);
TaskUser.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
TaskUser.belongsTo(Task, { constraints: true, onDelete: 'CASCADE' });
Comment.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
Comment.belongsTo(Task, { constraints: true, onDelete: 'CASCADE' });

sequelize
    // .sync({ force: true })
    .sync({ alter: true })
    // .sync()
    .then(result => {
        return Status.findAll();
    })
    .then(statusesInDB => {
        if (statusesInDB.length === 0) {
            statuses.forEach(async el => {
                Status.create({
                    ...el
                })
            })
        }
    })
    .then(result => {
        app.listen(settings.HTTP_SERVER_PORT, () => {
            console.log(`server started at ${settings.HTTP_SERVER_PORT} port`);
        });
    })
    .catch(err => {
        console.log(err);
    });
