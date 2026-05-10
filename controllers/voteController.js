const { pool } = require('../config/database');

exports.castVote = async (req, res) => {
    try {
        const { election_id, candidate_ids } = req.body;
        const user_id = req.user.id;
        const ip_address = req.ip;

        // check if feilds are empty
        if  (!election_id || !candidate_ids || candidate_ids.length ===0 ) {
            return res.status(400).json({
                success: false,
                message: 'شناسه انتخابات و نامزد الزامی است'
            });
        }

        // check if the election exists
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

        const election = elections[0];

        // check the election for being active
        const now = new Date();
        const startTime = new Date(election.start_time);
        const endTime = new Date(election.end_time);

        if (election.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'این انتخابات فعال نیست'
            });
        }

        if (now < startTime) {
            return res.status(400).json({
                success: false,
                message: 'انتخابات هنوز شروع نشده است'
            });
        }

        if (now > endTime) {
            return res.status(400).json({
                success: false,
                message: 'مهلت رای گیری به پایان رسیده است'
            });
        }

        //  Checking if the participant is authorized
        const [participants] = await pool.query(
            'SELECT * FROM election_participants WHERE election_id = ? AND user_id = ?',
            [election_id, user_id]
        );

        if (participants.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'شما مجاز به شرکت در این انتخابات نیستید'
            });
        }

        // check the number of choices
        if (candidate_ids.length > election.max_choices) {
            return res.status(400).json({
                success: false,
                message: `شما حداکثر میتوانید  ${election.max_choices} گزینه میتوانید انتخاب کنید `
            });
        }

        // Checking whether the user has already voted or not
        const [existingVote] = await pool.query(
            'SELECT * FROM votes WHERE election_id = ? AND user_id = ?',
            [election_id, user_id]
        );

        if (existingVote.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'شما قبلا در این انتخابات شرکت کرده اید'
            });
        }

        //  check if the candidates exist
        const [candidates] = await pool.query( 
            'SELECT * FROM candidates WHERE id IN (?) AND election_id = ?',
            [candidate_ids, election_id]
        );

        if (candidates.length !== candidate_ids.length) {
            return res.status(400).json({
                success: false,
                message: 'یک یا چند نامزد معتبر نیست'
            });
        }

        // vote registration
        for (const candidate_id of candidate_ids) {
            await pool.query(
                'INSERT INTO votes (election_id, user_id, candidate_id, ip_address) VALUES (?, ?, ?, ?)',
                [election_id, user_id, candidate_id, ip_address]    
            );
        }

        res.status(201).json({
            success: true,
            message: 'رای شما با موفقیت ثبت شد'
        });

    } catch (error) {
        console.error('خطا در ثبت رای:', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// results of election
exports.getResults = async (req, res) => {
    try {
        const { election_id } = req.params;

        // check if the election exist
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

        // getting result
        const [results] = await pool.query(
            `SELECT c.id, c.name, c.description,
            COUNT(v.id) as votes_count
            FROM candidates c
            LEFT JOIN votes v ON c.id = v.candidate_id
            WHERE c.election_id = ?
            GROUP BY c.id
            ORDER BY votes_count DESC`,
            [election_id]
        );

        // Calculate percentages
        const totalVotes = results.reduce((sum, c) => sum + parseInt(c.votes_count), 0);

        const resultsWithPercentage = results.map(c => ({
            ...c,
            percentage: totalVotes > 0 ? ((c.votes_count / totalVotes) * 100).toFixed(2) : 0
        }));

        res.json({
            success: true,
            data: {
                election: elections[0],
                total_votes: totalVotes,
                candidates: resultsWithPercentage
            }
        });

    } catch (error) {
        console.error('خطا در دریافت نتایج', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }  
};

// Checking the status of election
exports.checkVoted = async (req, res) => {
    try {
        const { election_id } = req.params;
        const user_id = req.user.id;

        const [votes] = await pool.query(
            'SELECT * FROM votes WHERE election_id = ? AND user_id = ?',
            [election_id, user_id]
        );

        res.json({
            success: true,
            has_voted: votes.length > 0,
            votes_count: votes.length
        });

    } catch (error) {
        console.error('خطا در چک کردن رای', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};

// Votes list of an election (just Admin)
exports.getAllVotes = async (req, res) => {
    try {
        const { election_id } = req.params;

        const [votes] = await pool.query(
            `SELECT v.*, u.full_name, c.name as candidate_name
            FROM votes v
            LEFT JOIN users u ON v.user_id = u.id
            LEFT JOIN candidates c ON v.candidate_id = c.id
            WHERE v.election_id = ?
            ORDER BY v.voted_at DESC`,
            [election_id]
        );

        res.json ({
            success: true,
            count: votes.length,
            data: votes
        });

    } catch (error) {
        console.error('خطا در دریافت آرا', error);
        res.status(500).json({
            success: false,
            message: 'خطای سرور'
        });
    }
};