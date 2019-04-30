exports.history =  (req, res) => {
    res.render('graph', {
        title: 'History',
        user: req.user,
        
    })
}

exports.loginPage = (req, res) => {
  res.render('login', { 
    title: 'Login' 
  });
};