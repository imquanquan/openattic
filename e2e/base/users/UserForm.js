var UserForm = function(){

  this.username = element(by.model('user.username'));
  this.password = element(by.model('user.password'));

  this.submit = function(){
    element(by.css('.tc_submitButton')).click();
  };
};
module.exports = UserForm;