exports.dashboard = (req, res) => {
    res.render('graph', {
        title: 'Living Lab'
    });
  };

exports.history =  (req, res) => {
    res.render('history', {
        title: 'History'
    })
}