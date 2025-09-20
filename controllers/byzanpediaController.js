// Byzanpedia controller - placeholder for future implementation
const getByzanpediaPage = (req, res) => {
    res.render('byzanpedia/index', {
        title: 'ByzanPedia - ByzantiumEdu',
        user: req.session.user
    });
};

module.exports = {
    getByzanpediaPage
};