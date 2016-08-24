function doContentRating (type_id, rating) 
{

     var url = ipb.vars['base_url'] + "app=core&module=ajax&section=reputation&do=add_rating&app_rate=forums&md5check=" + ipb.vars['secure_hash'] + "&type=pid&type_id=" + parseInt(type_id) + "&rating=" + parseInt( rating );

     new Ajax.Request( url,
						{
							method: 'post',
							evalJSON: 'force',
							onSuccess: function(t)
							{
								// alert(t.responseText); 
								if( Object.isUndefined( t.responseJSON ) )
								{
									alert( "Bad Request" + t.responseJSON );
								}
								else if ( t.responseJSON['error'] )
								{
									alert( t.responseJSON['error'] );
								}

							}
					       });	
}


	document.observe("dom:loaded", function(){

function flip(obj, vote) {
			
			if (vote == "up")
			{
				obj.next('div').down(4).innerHTML = parseInt(obj.next('div').down(2).innerHTML) + 1;
				obj.next('div').down(1).slideUp ({ duration: 0.2 });
				obj.toggleClassName("voted_like vdisabled");		
				obj.next('a').toggleClassName("voted_disabled vdisabled");	
				obj.writeAttribute('title', 'Thanks for voting!');
			}
			else {
				obj.previous('div').down(4).innerHTML = parseInt(obj.previous('div').down(2).innerHTML) - 1;				
				obj.previous('div').down(1).slideUp ({ duration: 0.2 });
				obj.toggleClassName("voted_dislike vdisabled");		
				obj.previous('a').toggleClassName("voted_disabled_like vdisabled");	
				obj.writeAttribute('title', 'Thanks for voting!');				
			}
		}


		var cards = $$('.votecard div');
		
		cards.each(function(card) {
		    var ihtml = card.innerHTML;

			card.down(1).innerHTML = parseInt(card.down(1).innerHTML) + 1;
			card.innerHTML = ihtml + card.innerHTML ;
			
		});
			
		var voteactions = $$('.voteaction_dislike');
		voteactions.each(function(voteaction) {
			voteaction.observe('click', function(event) {
				event.stop();
				
				if (!voteaction.hasClassName('vdisabled'))
				{
					var tid = this.id.replace("votedislike_","");
				        doContentRating (tid, -1);				
					
					flip(voteaction, "down");
				}
			});
		});
	
		var voteactions = $$('.voteaction_like');
		voteactions.each(function(voteaction) {
			voteaction.observe('click', function(event) {
				event.stop();
				
				if (!voteaction.hasClassName('vdisabled'))
				{
					var tid = this.id.replace("votelike_","");
					doContentRating (tid, 1);				
					
					flip(voteaction, "up");
				}
			});
		});		
		
		


});