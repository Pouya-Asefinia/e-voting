const { pool } = require('../config/database')

// Add user (Just Admin)
exports.add = async (req, res) => {
    try {
        const { election_id, user_id } = req.body;

        // Check if feilds are empty
        if (!election_id || !user_id) {
            return res.status(400).json({
                success: false,
                message: 'شناسه انتخابات و کاربر الزامی است'
            });
        }

        // Check if the election exist
        const [elections] = await pool.query(
            'SELECT * FROM elections WHERE id = ?',
            [election_id]
        );

        if (elections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'انتخابات یافت نشد'
            });
        }

        // Check if the user are exist
        const [users] = await pool.query(
            'SELECT * FROM users WHERE id = ?',
            [user_id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'کاربر یافت نشد'
            });
        }

        // Check for non-duplicates
        const [existing] = await pool.query(
            'SELECT * FROM election_participants WHERE election_id = ? AND user_id = ?',
            [election_id, user_id]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'این کاربر قبلا به لیست اضافه شده است'
            });
        }

        // ADD
        const [result] = await pool.query(
            'INSERT INTO election_participants (election_id, user_id) VALUES (?, ?)',
            [election_id, user_id]
        );

        res.status(201).json({
            success: true,
            message: 'کاربر با موفقیت به لیست شرکت کنندگان اضافه شد',
            data: {
                id: result.insertId,
                election_id,
                user_id,
                user_name: users[0].full_name
            }
        });

    } catch (error) {
        console.error('خطا در اضافه کردن شرکت کننده:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Add multiple users (Just Admin)
exports.addBulk = async (req, res) => {
    try {
        const {election_id, user_ids} = req.body;

        // Check if feilds are empty
        if (!election_id || !user_ids || user_ids.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'شناسه انتخابات و لیست کاربران الزامی است'
            });
        }

        // Check if the election is exist 
        const [elections] = await pool.query(
                'SELECT * FROM elections WHERE id = ?',
                [election_id]
        );

        if (elections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'انتخابات یافت نشد'
            });
        }

        // Add users one by one
        const added = [];
        const failed = [];

        for (const user_id of user_ids) {
            try {
                // Check for non-duplicates
                const [existing] = await pool.query(
                    'SELECT * FROM election_participants WHERE election_id = ? AND user_id = ?',
                    [election_id, user_id]
                );

                if (existing.length === 0) {
                    await pool.query(
                        'INSERT INTO election_participants (election_id, user_id) VALUES (?, ?)',
                        [election_id, user_id]
                    );
                    added.push(user_id);
                } else {
                    failed.push(user_id)
                }
            } catch (e) {
                failed.push(user_id);
            }
        }

        res.status(201).json({
            success: true,
            message: `تعداد ${added.length} کاربر اضافه شد`,
            data: {
                added_count: added.length,
                failed_count: failed.length,
                added_users: added,
                failed_users: failed
            }
        });

    } catch (error) {
        console.error('خطا در اضافه کردن گروهی:', error);
        res.status(500).json({
            success: false,
            message:'خطای سرور'
        });
    }
};

//  List of Participants in an election
exports.getByElection = async (req, res) => {
    try {
        const { election_id } = req.params;
        const electionId = parseInt(election_id);
        
        // Check if the election is exist 
        const [elections] = await pool.query(
            'SELECT * FROM elections WHERE id = ?',
            [electionId]
        );
        if (elections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'انتخابات یافت نشد'
            });
        }
        const [participants] = await pool.query(
            `SELECT ep.*, u.username, u.full_name
            FROM election_participants ep
            LEFT JOIN users u ON ep.user_id = u.id
            WHERE ep.election_id = ?
            ORDER BY ep.created_at DESC`,
            [electionId]
        );
        res.json({
            success: true, 
            count: participants.length,
            data: participants
        });
    } catch (error) {
        console.error('خطا در خواندن شرکت کنندگان:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// A user election list
exports.getByUser = async (req, res) => {
    try {
        const { user_id } = req.params;

        const [participations] = await pool.query(
            `SELECT ep.*, e.title, e.description, e.start_time, e.end_time, e.status
            FROM election_participants ep
            LEFT JOIN elections e ON ep.election_id = e.id
            WHERE ep.user_id = ?
            ORDER BY ep.created_at DESC`,
            [user_id]
        );

        res.json({
            success: true,
            count: participations.length,
            data: participations
        });

    } catch (error) {
        console.error('خطا در خواندن انتخابات کاربر:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Delete participant (Just Admin)
exports.remove = async (req, res) => {
    try {
        const { election_id, user_id } = req.params;

        // Check for exist
        const [participants] = await pool.query(
            'SELECT * FROM election_participants WHERE election_id = ? AND user_id = ?',
            [election_id, user_id]
        );

        if (participants.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'شرکت کننده یافت نشد'
            });
        }

        // Delete
        await pool.query(
            'DELETE FROM election_participants WHERE election_id = ? AND user_id = ?',
            [election_id, user_id]
        );

        res.json({
            success: true,
            message: 'کاربر از لیست شرکت کنندگان حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف شرکت کننده:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Participants List (For chois in Admin panel)
exports.getUsers = async (req, res) => {
    try {
        const { election_id } = req.query;

        let query = 'SELECT id, username, full_name, role FROM users WHERE role = "voter"';
        let params = [];

        // If election_id is given, also show users who were previously added.
        if  (election_id) {
            query = `SELECT u.id, u.username, u.full_name, u.role,
                    CASE WHEN ep.id IS NOT NULL THEN 1 ELSE 0 END as is_added
                    FROM users u
                    LEFT JOIN election_participants ep ON u.id = ep.user_id AND ep.election_id = ?
                    WHERE u.role = 'voter'`;
            params = [election_id];
        }

        const [users] = await pool.query(query, params);

        res.json({
            success: true,
            count: users.length,
            data: users
        });

    } catch (error) {
        console.error('خطا در خواندن کاربران:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};