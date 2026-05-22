const { pool } = require('../config/database');

// Create Announcement (Just Admin)
exports.create = async (req, res) => {
    try {
        const { title, content, election_id } = req.body;

        // Check if fields are empty
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: 'عنوان و محتوا الزامی است'
            });
        }

        // If election_id is given, check if it exists.
        if (election_id) {
            const[elections] = await pool.query(
                'SELECT * FROM elections WHERE id = ?',
                [election_id]
            );
            if (elections.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'انتخابات یافت نشد'
                });
            }
        }

        // Create Announcement
        const [result] = await pool.query(
            'INSERT INTO announcements (title, content, election_id) VALUES (?, ?, ?)',
            [title, content, election_id || null]
        );
        
        res.status(201).json({
            success: true,
            message: 'اعلان با موفقیت ساخته شد',
            data: {
                id: result.insertId,
                title,
                content,
                election_id: election_id || null
            }
        });

    } catch (error) {
        console.error('خطا در ساخت اعلان', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// List of all Announcements
exports.getAll = async (req, res) => {
    try {
        const [announcements] = await pool.query(
            `SELECT a.*, e.title as election_title
            FROM announcements a
            LEFT JOIN elections e ON a.election_id = e.id
            ORDER BY a.created_at DESC`
        );
        res.json({
            success: true,
            count: announcements.length,
            data: announcements
        });

    } catch (error) {
        console.error('خطا در خواندن اعلانات', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Active Announcements list (For Home page)
exports.getActive = async (req, res) => {
    try {
        const [announcements] = await pool.query(
            `SELECT a.*, e.title as election_title, e.start_time, e.end_time, e.status
            FROM announcements a
            LEFT JOIN elections e ON a.election_id = e.id
            ORDER BY a.created_at DESC
            LIMIT 10`
        );

        res.json({
            success: true,
            count: announcements.length,
            data: announcements
        });

    } catch (error) {
        console.error('خطا در خواندن اعلانات', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

//  Details of an Announcement
exports.getOne = async (req, res) => {
    try {
        const { id } = req.params;

        const [announcements] = await pool.query(
            `SELECT a.*, e.title as election_title, e.start_time, e.end_time, e.status
            FROM announcements a
            LEFT JOIN elections e ON a.election_id = e.id
            WHERE a.id = ?`,
            [id]
        );

        if (announcements.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اعلان یافت نشد'
            });
        }

        res.json({
            success: true,
            data: announcements[0]
        });

    } catch (error) {
        console.error('خطا در خواندن اعلان', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Update Announcement (Just Admin)
exports.update = async (req, res) => {
    try { 
        const { id } = req.params;
        const { title, content, election_id } = req.body;

        // Check if Announcement are exist
        const [announcements] = await pool.query(
            'SELECT * FROM announcements WHERE id = ?',
            [id]
        );

        if (announcements.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اعلان یافت نشد'
            });
        }

        // Update
        await pool.query(
            'UPDATE announcements SET title = ?, content = ?, election_id = ? WHERE id = ?',
            [title, content, election_id || null, id]
        );

        res.json({
            success: true,
            message: 'اعلان با موفقیت ویرایش شد'
        });

    } catch (error) { 
        console.error('خطا در ویرایش اعلان', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Delete Announcement (Just Admin)
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the Announcement are exist
        const [announcements] = await pool.query(
            'SELECT * FROM announcements WHERE id = ?',
            [id]
        );

        if (announcements.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'اعلان یافت نشد'
            });
        }

        // Delete
        await pool.query('DELETE FROM announcements WHERE id = ?', [id]);

        res.json({
            success: true,
            message: 'اعلان با موفقیت حذف شد'
        });

    } catch (error) {
        console.error('خطا در حذف اعلان:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
        
    }
};