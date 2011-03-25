
$('A.thumb').live("hover", function(e){e.preventDefault(); $(".show:visible").hide(); $($(this).attr("rel")).show()})
$('A.thumb').live("hover", function(e){
	e.preventDefault();
	$(".show:visible").hide(); 
	$($(this).attr("rel")).show()
	var status = $(this).parent().data("status");
	var exp = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
	replaced = status.text.replace(exp,'<a href="$1" target="_blank">$1</a>'); 
	var s = '<a target="_blank" href="http://twitter.com/'+status.from_user+'"><img src="'+status.profile_image_url+'" /></a>';
	s += '<a target="_blank" class="title" href="http://twitter.com/'+status.from_user+'" >'+status.from_user+'</a><p>'+replaced+'</p>';
	s += '<ul><li><a  target="_blank" href="http://twitter.com/?status=@'+status.from_user+'&in_reply_to_status_id='+status.id+'&in_reply_to='+status.from_user+'">Reply</a></li>';
	s += '<li><a  target="_blank" href="http://twitter.com/?status=RT: @'+status.from_user+' '+escape(status.text)+'">Retweet</a></li></ul>';
	$('.info').html(s);
	$('.info').show();
 }
)


function create_result(oembed, status){
	var l = '<li class="result"><a href="#" rel="#'+status.id+'"class="thumb"><img src="'+oembed.thumbnail_url+'" /></a></li>';
	var s = '<div id="'+status.id+'" class="show"><img class="large" src="'+oembed.url+'"/></div>';

	$(".results UL").append(l);
	$(".shows").append(s);
	$('.results UL LI:last').eq(0).data({json : oembed, status : status });
	$("IMG.large").css("maxWidth", window_width-20);
	$("IMG.large").css("maxHeight", window_hight-120);

	if (oembed.height < (window_hight-120)){
		var margin = Math.floor((window_hight-120 - oembed.height) / 2);
		$("#"+status.id).css("margin", margin+"px 0 0 0");
	} else {
		$("#"+status.id).css("margin", "5px 0 0 0");
	}
	
	
}

var window_width = $(window).height();
var window_hight = $(window).width();

function setWindowSizes(){
	window_hight = $(window).height();
	window_width = $(window).width();
	$("IMG.large").css("maxWidth", window_width-20);
	$("IMG.large").css("maxHeight", window_hight-120);
	
}

var page = 1;
var search_q= null;

function search_twitter(q, clear){
	search_q = q;
	q += " twitpic OR yfrog OR flic.kr OR tweetphoto OR twitgoo OR post.ly OR tumblr.com OR moby.to OR imgur filter:links";

	if (clear){
		page = 1;
		$(".shows").html('');
		$(".info").html('');
		$(".results UL").html('');
		$(".results UL").css('left', 0);
	}

	$(".show").hide();
	if( !$("#loading").length){
		$(".shows").prepend('<div id="loading" class="show"><span class="loading"></span></div>');
	}
	$("#loading").show();
	$('A.nextPage').hide();
	$.ajax({url : "http://search.twitter.com/search.json?q="+escape(q)+"&page="+page+"&rpp=15&callback=?",
			success : function(data){
				
        //nothing availabe from search
				if (data.results.length == 0){
					if(clear){
						$(".show").hide();
						$(".shows").prepend('<div class="error show" style="display:block;"><span>No Results Found</span></div>');
					} else {
						page = 100;
						$('A.thumb:last').trigger("mouseover");
					}
					return false;
				}
		
		    //round up valid urls and statuses
				var urls = new Array();
				var statuses = new Array();
				for (i=0;i<data.results.length;i++)
				{
					var obj = data.results[i];
					var e=/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
					var p = obj.text.match(e);
					
					if (p != null){
						var u = p[0].replace(' ', '');
						//keep track of urls and status objs	
						var idx = urls.length;
						urls[idx] = u;
						statuses[idx] = obj;
					}
				}

        //call embedly and build display
				var counter = 0;
				$.embedly(urls, {maxWidth:500},
								function(oembed){					
									if (oembed != null && oembed.type == "photo"){
										create_result(oembed, statuses[counter]);
										scroller.reload();
									}           
                  counter = counter + 1;
                  
		
					    });
			},
			async : false,
			dataType: "json",
			complete : function(){$('A.nextPage').show(); $("#loading").hide();}
	})

	page += 1;

	$('.info:hidden').show();
	if (clear){
		$('A.thumb:first').trigger("mouseover");
	}
}

var scroller = null

$(document).ready(function() {

	$(".search").overlay();
	$(".about").overlay();
	$(".about_f").overlay();
	setWindowSizes();

	var size = Math.floor((window_width - 80)/110);
	$('.results').css("width", (110*size)); 
	scroller = $(".results").scrollable({ size: size, api:true});
	
	scroller.onSeek(function(){
		if (scroller.getPageAmount() == (scroller.getPageIndex() +1)){
			if (page < 6){
				search_twitter(search_q);
			} else {
				$('A.nextPage').hide();
			}
		} else {
			$('A.nextPage').show();
		}
	});
	
	$("#findform").bind('submit', function(e){
		e.preventDefault();
		var q = $(this).find('.q').val();
		if (q == '')
			return false;
		if (q.length > 29){
			alert("Queries can only be 29 characters long. Yours is "+ q.length);
			return false;
		}
			
		$("#search .close").trigger("click");
		search_twitter(q, true);
	});
	$(".search").trigger("click");
	$(".q").focus();
});
