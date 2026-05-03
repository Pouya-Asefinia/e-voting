const { pool } = require('../config/database');

// creating a new election just (Admin)
exports.create = async (req, res) => {
    try {
        const { title, description, start_time, end_time, max_choices } = req.body;

        // Check if fields are empty
        if (!title || !start_time || !end_time) {
            return res.status(400).json({
                success: false,
                message: 'عنوان, زمان شروع و پایان الزامی است'
            });
        }

        // checking Dates
        if (new Date(start_time) >= new Date(end_time)) {
            return res.status(400).json({
                success: false,
                message: 'تاریخ پایان باید بعد از تاریخ شروع باشد'
            });
        }

        // creating election
        const [result] = await pool.query(
            `INSERT INTO elections (title, description, start_time, end_time, max_choices, status, created_by) 
             VALUES (?, ?, ?, ?, ?, 'draft', ?)`,
            [title, description, start_time, end_time, max_choices || 1, req.user.id]
        );

        res.status(201).json({
            success: true,
            message: 'انتخابات با موفقیت ساخته شد',
            data: {
                id: result.insertId,
                title,
                description,
                start_time,
                end_time,
                max_choices: max_choices || 1,
                status: 'draft'
            }
        });

    } catch (error) {
        console.error('خطا در ساخت انتخابات:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Reading all elections
exports.getAll = async (req, res) => {
    try {
        const [elections] = await pool.query(
            `SELECT e.*, u.full_name as creator_name,
             (SELECT COUNT(*) FROM candidates WHERE election_id = e.id) as candidates_count,
             (SELECT COUNT(*) FROM votes WHERE election_id = e.id) as votes_count
             FROM elections e
             LEFT JOIN users u ON e.created_by = u.id
             ORDER BY e.created_at DESC`
        );

        res.json({
            success: true,
            count: elections.length,
            data: elections
        });

    } catch (error) {
        console.error('خطا در خواندن انتخابات:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Read an election
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;

        // read the election
        const [elections] = await pool.query(
            `SELECT e.*, u.full_name as creator_name
             FROM elections e
             LEFT JOIN users u ON e.created_by = u.id
             WHERE e.id = ?`,
            [id]
        );

        if (elections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'انتخابات یافت نشد'
            });
        }

        // Reading candidates
        const [candidates] = await pool.query(
            'SELECT * FROM candidates WHERE election_id = ?',
            [id]
        );

        // Reading the number of votes
        const [votesCount] = await pool.query(
            'SELECT COUNT(*) as total FROM votes WHERE election_id = ?',
            [id]
        );

        res.json({
            success: true,
            data: {
                ...elections[0],
                candidates,
                votes_count: votesCount[0].total
            }
        });

    } catch (error) {
        console.error('خطا در خواندن انتخابات:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Update the Election just (Admin)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, start_time, end_time, max_choices, status } = req.body;

        // Check if there are elections
        const [elections] = await pool.query(
            'SELECT * FROM elections WHERE id = ?',
            [id]
        );

        if (elections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'انتخابات یافت نشد'
            });
        }

        // Update
        await pool.query(
            `UPDATE elections 
             SET title = ?, description = ?, start_time = ?, end_time = ?, max_choices = ?, status = ?
             WHERE id = ?`,
            [title, description, start_time, end_time, max_choices, status, id]
        );

        res.json({
            success: true, 
            message: 'انتخابات با موفقیت ویرایش شد'
        });

    } catch (error) {
        console.error('خطا در ویرایش انتخابات:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Delete the election just (Admin)
exports.delete = async(req, res) => {
    try {
        const { id } = req.params;

        // check if there are elections
        const [elections] = await pool.query(
            'SELECT * FROM elections WHERE id = ?',
            [id]
        );

        if (elections.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'انتخابات یافت نشد'
            });
        }

        // حذف (CASCADE نامزدها و آرا رو هم حذف می‌کنه)
        await pool.query('DELETE FROM elections WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'انتخابات با موفقیت حذف شد'
        });
    
    } catch (error) {
        console.error('خطا در حذف انتخابات:', error);
        res.status(500).json({
            success:false,
            message: 'خطای سرور'
        });
    }
};