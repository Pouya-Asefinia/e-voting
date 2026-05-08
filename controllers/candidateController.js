const { pool } = require('../config/database');

// Creating a new candidate (just Admin)
exports.create = async (req, res) => {
    try {
        const { election_id, name, description } = req.body;

        // check if feilds are empty
        if (!election_id || !name) {
            return res.status(400).json({
                success: false,
                message: 'شناسه انتخابات و نام نامزد الزامی است'
            });
        }

        // Check if the election exists
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

        // creating candidate 
        const [result] = await pool.query(
            'INSERT INTO candidates (election_id, name, description) VALUES (?, ?, ?)',
            [election_id, name, description || '']
        );

        res.status(201).json({
            success: true,
            message: 'نامزد با موفقیت ساخته شد',
            data: {
                id: result.insertId,
                election_id,
                name,
                description: description || ''
            }
        });

    } catch (error) {
        console.error('خطا در ساخت نامزد', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// List of candidates for an election
exports.getByElection = async (req, res) => {
    try {
        const { election_id } = req.params;

        const [candidates] = await pool.query(
            `SELECT c.*, 
            (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as votes_count
            FROM candidates c
            WHERE c.election_id = ?
            ORDER BY c.created_at ASC`,
            [election_id]
        );

        res.json({
            success: true, 
            count: candidates.length,
            data: candidates
        });

    } catch (error) {
        console.error('خطا در خواندن نامزد ها', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Details of candidate
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;

        const [candidates] = await pool.query(
            `SELECT c.*, e.title as election_title,
            (SELECT COUNT(*) FROM votes WHERE candidate_id = c.id) as votes_count
            FROM candidates c
            LEFT JOIN elections e ON c.election_id = e.id
            WHERE c.id = ?`,
            [id]
        );

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'نامزد یافت نشد'
            });
        }

        res.json({
            success: true,
            data: candidates[0]
        });

    } catch (error) {
        console.error('خطا در خواندن نامزد:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Update candidate (just Admin)
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        // Checking for candidate existence
        const [candidates] = await pool.query(
            'SELECT * FROM candidates WHERE id = ?',
            [id]
        );

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'نامزد یافت نشد'
            });
        }

        // update
        await pool.query(
            'UPDATE candidates SET name = ?, description = ? WHERE id = ?',
            [name, description, id]
        );

        res.json({
            success: true,
            message: 'نامزد با موفقیت ویرایش شد'
        });

    } catch (error) {
        console.error('خطا در ویرایش نامزد:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Delete the candidate
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Checking for candidate existence
        const [candidates] = await pool.query(
            'SELECT * FROM candidates WHERE id = ?',
            [id]
        );

        if (candidates.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'نامزد یافت نشد'
            });
        }

        // delete
        await pool.query('DELETE FROM candidates WHERE id = ?', [id]);

        res.json({
            success: true, 
            message: 'نامزد با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف نمازد:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });   
    }
};