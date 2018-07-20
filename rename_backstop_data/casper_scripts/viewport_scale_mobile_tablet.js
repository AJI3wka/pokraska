module.exports = function(casper, scenario, vp) {
  casper.echo('onReady.js', 'INFO');
  
  var viewport_desctop = 1200;
  var viewport_mobile = 480;

if (vp.width <= 1024 && vp.width >750) {

  var scale = viewport_desctop/vp.width;
  var height = vp.height*scale;

  casper.viewport(viewport_desctop, height);

}else if(vp.width <= 750){

  var scale = viewport_mobile/vp.width;
  var height = vp.height*scale;

  casper.viewport(viewport_mobile, height);
}
  casper.evaluate(function(){

  });
  //casper.mouse.click("a.zz-btn");
  casper.wait(50);


};
