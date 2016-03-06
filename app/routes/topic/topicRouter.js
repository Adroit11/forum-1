var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('../../../config/database');
var connection = mysql.createConnection(dbconfig.connection);

router.post('/addpost',function(req,res){

});
router.get('/addpost', isLoggedIn, function(req, res) {
  res.render('addpost.ejs', {
    user : req.user
  });
});

router.post('/addtopic',function(req,res){
  connection.query('INSERT INTO topics (title,categoryId,userid) values(?,?,?)', [req.body.topic,req.body.catid,req.user.id], function(err, result) {
    console.log(req.body.topic+" ||"+err);
    var topicId=result.insertId;
    if(!err)
    connection.query('INSERT INTO posts (topicid,message,userid) values('+topicId+',?,?)', [req.body.body,req.user.id], function(err, result) {
      console.log("Insert error:"+err);
      res.redirect('/topic/viewposts/'+topicId+'/'+req.body.topic);
    });
  });
});
router.get('/addtopic/:catid/:category', isLoggedIn, function(req, res) {
  console.log("catid:"+req.params.catid);
  res.render('addtopic.ejs', {
    user : req.user,
    catid:req.params.catid
  });
});


router.post('/addreply',function(req,res){
  connection.query('INSERT INTO posts (title,topicid,message,userid) values(?,?,?,?)', [req.body.title,req.body.topicid,req.body.body,req.user.id], function(err, result) {
    console.log(err);
    res.redirect('/topic/viewposts/'+req.body.topicid+'/'+req.body.title);
  });
});
router.get('/addreply/:topicid', isLoggedIn, function(req, res) {
  res.render('addreply.ejs', {
    user : req.user,
    topicid:req.params.topicid
  });
});
router.post('/editreply',function(req,res){
  connection.query('UPDATE posts SET title=?,message=? where id=?', [req.body.title,req.body.body,req.body.replyid], function(err, result) {
    console.log(err);
    res.redirect('/topic/viewposts/'+req.body.topicid+'/'+req.body.title);
  });
});
router.get('/editreply/:replyid', isLoggedIn, function(req, res) {
  var replyId=req.params.replyid;
  connection.query('SELECT * FROM posts where id=?',[replyId],function(err, reply, fields){
    if (err) throw err;
    if((reply[0].userid!=req.user.id) && (req.user.type!="admin")){
      req.flash('editMessage', 'Only an admin can edit/delete others post.');
      res.redirect('/');
    }else{
      res.render('editreply.ejs', {
        user : req.user,
        replyid:req.params.replyid,
        reply:reply
      });
    }

  });

});

router.get('/viewtopics/:catid/:category',function(req, res) {
  var categoryId=req.params.catid;
    console.log("catid:"+categoryId);
    connection.query('SELECT *,(select count(*) from posts where topicid=topics.id) as replyCount,topics.id as topicid FROM topics,users,categories where categoryId=? and topics.userid=users.id and categories.id=categoryId',[categoryId],function(err, topics, fields){
    if (err) throw err;
    res.render('viewtopics.ejs', {
      user : req.user,
      catid:categoryId,
      topics:topics
    });
  });
});

router.get('/viewposts/:topicid/:title',function(req, res) {
  var topicId=req.params.topicid;
    connection.query('SELECT title FROM topics where id=?',[topicId],function(er, topic, f){
      connection.query('SELECT *,posts.id as postid FROM posts,users where topicId=? and userid=users.id',[topicId],function(err, posts, fields){
        if (err) throw err;

      res.render('viewposts.ejs', {
        user : req.user,
        topicid:topicId,
        posts:posts,
        topic:topic
      });
    });
  });
});

function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
		return next();

	// if they aren't redirect them to the home page
	res.redirect('/login');
}

module.exports = router;
