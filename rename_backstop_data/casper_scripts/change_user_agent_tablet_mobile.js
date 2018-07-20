 module.exports = function(casper, scenario, vp) {
   	

   //}



      casper.thenOpen(scenario.url, function(){

      	if (vp.width > 1024) {
      		casper.userAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36');
      		console.log('-----------------');
      		console.log('uA:desctop');
      		console.log('vp: '+vp.width+' '+vp.height);
      		console.log('-----------------');
      	}else{
      		casper.userAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5376e Safari/8536.25');	
      		console.log('-----------------');
      		console.log('uA:mobile');
      		console.log('vp: '+vp.width+' '+vp.height);
      		console.log('-----------------');     		
      	}


      });



 };
