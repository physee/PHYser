exports.dashboard = (req, res) => {
    res.render('dashboard', {
        title: 'Live'
    });
  };

exports.history =  (req, res) => {
    res.render('graph', {
        title: 'History'
    })
}