const Status = require('../models/status');

exports.getStatuses = async (req, res, next) => {
    try {
        let statuses = [];
        if (req.user.admin) {
            statuses = await Status.findAll();
        } else {
            statuses = await Status.findAll({ where: { admin: false } });
        }

        res.status(200).send({
            statuses: statuses.map(el => {
                return {
                    id: el.id,
                    name: el.name
                }
            })
        });
    } catch (err) {
        res.status(400).send({ message: JSON.stringify({ common: err.toString() }) });
    }
}
