
// Tiles function sets name, price, color etc. for each tile
function Tiles(name, pricetext, color, price, groupNum, baserent, level1, level2, level3, level4, level5) {
	this.name = name;
	this.pricetext = pricetext;
	this.color = color;
	this.owner = 0;
	this.mortgage = false;
	this.house = 0;
	this.hotel = 0;
	this.groupNum = groupNum || 0;
	this.price = (price || 0);
	this.baserent = (baserent || 0);
	this.level1 = (level1 || 0);
	this.level2 = (level2 || 0);
	this.level3 = (level3 || 0);
	this.level4 = (level4 || 0);
	this.level5 = (level5 || 0);
	this.landcount = 0;

	if (groupNum === 3 || groupNum === 4) {
		this.houseprice = 50;
	} else if (groupNum === 5 || groupNum === 6) {
		this.houseprice = 100;
	} else if (groupNum === 7 || groupNum === 8) {
		this.houseprice = 150;
	} else if (groupNum === 9 || groupNum === 10) {
		this.houseprice = 200;
	} else {
		this.houseprice = 0;
	}
}
// card sets the text on the card and the action it will perform
function Card(text, action) {
	this.text = text;
	this.action = action;
}

// Function to create an AI player
function AI(p) {
    this.alertList = "";

    // used to keep count of AI players in a game for naming reasons
    this.constructor.count++;

    p.name = "AI " + this.constructor.count;

    //Function to allow AI to buy property
    this.buyProperty = function(index) {
        console.log("buyProperty");
        var s = square[index];    // s is equal to an index of the squares

        if (p.money > s.price + 50) { // AI will attempt to buy if its money is greater than the property price + 50
            return true;
        }
        else {        //otherwise it fails
            return false;
        }

    }
	this.onLand = function() {
		console.log("onLand");
	}

    //Function to control actions of AI before it rolls
    this.beforeTurn = function() {
        console.log("beforeTurn");
        var s;
        var allGroupOwned;
        var max;
        var leastHouseProperty;
        var leastHouseNumber;

        // for loop to allow the AI to buy houses
        for (var i = 0; i < 40; i++) {
            s = square[i];

            // if the owner is the AI and the groupnumber of the properties is more than 2
            if (s.owner === p.index && s.groupNumber >= 3) {
                max = s.group.length;
                allGroupOwned = true;
                leastHouseNumber = 6; // No property will ever have 6 houses.

                for (var j = max - 1; j >= 0; j--) { // a for loop to iterate though the groups of properties
                    if (square[s.group[j]].owner !== p.index) { //if the owner of the group isnt in player index
                        allGroupOwned = false; //if all are not owned
                        break; //break
                    }

                    if (square[s.group[j]].house < leastHouseNumber) { //find the property from the set with the leasthouses
                        leastHouseProperty = square[s.group[j]]; //let the variable leastHouseProperty = the property
                        leastHouseNumber = leastHouseProperty.house;
                    }
                }
                //if not all of the group are owned break the loop
                if (!allGroupOwned) {
                    continue;
                }
                // if player money is greater than the house price + 100
                if (p.money > leastHouseProperty.houseprice + 100) {
                    buyHouse(leastHouseProperty.index); //buy the house
                }


            }
        }

        // For loop to allow AI to unmortgage properties
        for (var i = 39; i >= 0; i--) {
            s = square[i];

            if (s.owner === p.index && s.mortgage && p.money > s.price) {
                unmortgage(i);
            }
        }

        return false;
    }

    //function to allow the AI to pay the 50 to get out of jail
    this.postBail = function() {
        console.log("postBail");

        // if the AI is on it's third roll in jail
        if ((p.communityChestJailCard || p.chanceJailCard) && p.jailroll === 2){ // if it has a communitychest or chance jail card
            return true; //Use the card
        } else {
            return false; // Otherwise roll and pay the 50 to get out
        }
    }

    // Function to allow the AI to pay off money owed to players
    this.payDebt = function() {
        console.log("payDebt");
        for (var i = 39; i >= 0; i--) {
            s = square[i];
            //if it owns the squares and they are not already mortgaged or have houses built on them,
            if (s.owner === p.index && !s.mortgage && s.house === 0) {
                mortgage(i); //mortage the properties
                console.log(s.name);
            }
            //if money becomes positive again stop mortgaging
            if (p.money >= 0) {
                return;
            }
        }

    }

    //function to allow AI to bid at an auction
    this.bid = function(property, currentBid) {
        console.log("bid");
        var bid;
        // current bid is a random number between 0-1 * 20 + 10 which is rounded to the nearest whole number
        bid = currentBid + Math.round(Math.random() * 20 + 10);
        // if the AI money is less than the bid + 50 or if the bid is greater than the property price * 1.5
        if (p.money < bid + 50 || bid > square[property].price * 1.5) {
            return -1; //do not bid
        } else {
            return bid; // otherwise bid
        }

    }
}


// Intrustions for food areas
function foodArea() {
	return '&nbsp;If one "Food Area" is owned rent is 4 times amount shown on dice.<br /><br />&nbsp;If both "food Area" are owned rent is 10 times amount shown on dice.';
}
// Intrustions for Campuses
function campus() {
	return '<div style="font-size: 14px; line-height: 1.5;">Rent<span style="float: right;">$25.</span><br />If 2 campuses are owned<span style="float: right;">50.</span><br />If 3 campuses are owned<span style="float: right;">100.</span><br />If 4 campuses are owned<span style="float: right;">200.</span></div>';
}

// Instructions for Student Levy
function studentlevy() {
	addAlert(player[turn].name + " paid $100 for landing on Student Levy.");
	player[turn].pay(100, 0);

	$("#landed").show().text("You landed on Student Levy. Pay $100.");
}
// Instructions for Student Fees
function studentfees() {
	addAlert(player[turn].name + " paid $200 for landing on Student Fees.");
	player[turn].pay(200, 0);

	$("#landed").show().text("You landed on Student Fees. Pay $200.");
}
// Empty square list
var square = [];

// Adding the tiles in with instructions
square[0] = new Tiles("GO", "COLLECT $200 SALARY AS YOU PASS.", "#FFFFFF");
square[1] = new Tiles("Henry Grattan Building", "$60", "#8B4513", 60, 3, 2, 10, 30, 90, 160, 250);
square[2] = new Tiles("Community Chest", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF");
square[3] = new Tiles("Albert College", "$60", "#8B4513", 60, 3, 4, 20, 60, 180, 320, 450);
square[4] = new Tiles("Registration Fees", "Pay $200", "#FFFFFF");
square[5] = new Tiles("Glasnevin Campus", "$200", "#FFFFFF", 200, 1);
square[6] = new Tiles("Hamilton Building", "$100", "#87CEEB", 100, 4, 6, 30, 90, 270, 400, 550);
square[7] = new Tiles("Chance", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF");
square[8] = new Tiles("Terence Larkin Building", "$100", "#87CEEB", 100, 4, 6, 30, 90, 270, 400, 550);
square[9] = new Tiles("Hampsted", "$120", "#87CEEB", 120, 4, 8, 40, 100, 300, 450, 600);
square[10] = new Tiles("Just Visiting", "", "#FFFFFF");
square[11] = new Tiles("Larkfield", "$140", "#FF0080", 140, 5, 10, 50, 150, 450, 625, 750);
square[12] = new Tiles("Glasnevin Resturant", "$150", "#FFFFFF", 150, 2);
square[13] = new Tiles("Invent Building", "$140", "#FF0080", 140, 5, 10, 50, 150, 450, 625, 750);
square[14] = new Tiles("NICB Building", "$160", "#FF0080", 160, 5, 12, 60, 180, 500, 700, 900);
square[15] = new Tiles("Saint Patricks Campus", "$200", "#FFFFFF", 200, 1);
square[16] = new Tiles("Lonsdale Building", "$180", "#FFA500", 180, 6, 14, 70, 200, 550, 750, 950);
square[17] = new Tiles("Community Chest", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF");
square[18] = new Tiles("Stokes Building", "$180", "#FFA500", 180, 6, 14, 70, 200, 550, 750, 950);
square[19] = new Tiles("Marconi Building", "$200", "#FFA500", 200, 6, 16, 80, 220, 600, 800, 1000);
square[20] = new Tiles("Free Parking", "", "#FFFFFF");
square[21] = new Tiles("DCU Business School", "$220", "#FF0000", 220, 7, 18, 90, 250, 700, 875, 1050);
square[22] = new Tiles("Chance", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF");
square[23] = new Tiles("Inner Faith Centre", "$220", "#FF0000", 220, 7, 18, 90, 250, 700, 875, 1050);
square[24] = new Tiles("John & Aileen O'Reilly Library", "$240", "#FF0000", 240, 7, 20, 100, 300, 750, 925, 1100);
square[25] = new Tiles("All Hallows Campus", "$200", "#FFFFFF", 200, 1);
square[26] = new Tiles("Eswell Building", "$260", "#FFFF00", 260, 8, 22, 110, 330, 800, 975, 1150);
square[27] = new Tiles("Healthy Living Centre", "$260", "#FFFF00", 260, 8, 22, 110, 330, 800, 975, 1150);
square[28] = new Tiles("On Campus Londis", "$150", "#FFFFFF", 150, 2);
square[29] = new Tiles("MacCormac Building", "$280", "#FFFF00", 280, 8, 24, 120, 360, 850, 1025, 1200);
square[30] = new Tiles("Go to Jail", "Go directly to Jail. Do not pass GO. Do not collect $200.", "#FFFFFF");
square[31] = new Tiles("McNulty Building", "$300", "#008000", 300, 9, 26, 130, 390, 900, 1100, 1275);
square[32] = new Tiles("The Pavillion", "$300", "#008000", 300, 9, 26, 130, 390, 900, 1100, 1275);
square[33] = new Tiles("Community Chest", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF");
square[34] = new Tiles("The Helix", "$320", "#008000", 320, 9, 28, 150, 450, 1000, 1200, 1400);
square[35] = new Tiles("DCU Sports Campus", "$200", "#FFFFFF", 200, 1);
square[36] = new Tiles("Chance", "FOLLOW INSTRUCTIONS ON TOP CARD", "#FFFFFF");
square[37] = new Tiles("The SU Building", "$350", "#0000FF", 350, 10, 35, 175, 500, 1100, 1300, 1500);
square[38] = new Tiles("Student Levy", "Pay $100", "#FFFFFF");
square[39] = new Tiles("The Nu Bar", "$400", "#0000FF", 400, 10, 50, 200, 600, 1400, 1700, 2000);

// Empty Community Chest Cards and Chance Cards List
var communityChestCards = [];
var chanceCards = [];

// Assigning Community Chest cards into the list with certain tasks and actions
communityChestCards[0] = new Card("Get out of Jail, Free. This card may be kept until needed or sold.", function(p) { p.communityChestJailCard = true; updateOwned();});
communityChestCards[1] = new Card("You have won Mi Soc hotdog eating contest. Collect $10.", function() { addamount(10, 'Community Chest');});
communityChestCards[2] = new Card("From sale of old college books, you get $50.", function() { addamount(50, 'Community Chest');});
communityChestCards[3] = new Card("You get SUSI. Collect $100.", function() { addamount(100, 'Community Chest');});
communityChestCards[4] = new Card("You inherit $100.", function() { addamount(100, 'Community Chest');});
communityChestCards[5] = new Card("Receive $25 for helping a mate with a project.", function() { addamount(25, 'Community Chest');});
communityChestCards[6] = new Card("You threw a party in your dorm. Pay damage fees of $100.", function() { subtractamount(100, 'Community Chest');});
communityChestCards[7] = new Card("Bank error in your favor. Collect $200.", function() { addamount(200, 'Community Chest');});
communityChestCards[8] = new Card("You have to buy a book for a new module. Pay $50.", function() { subtractamount(50, 'Community Chest');});
communityChestCards[9] = new Card("It is your birthday. Collect $10 from every player.", function() { collectfromeachplayer(10, 'Community Chest');});
communityChestCards[10] = new Card("Advance to \"GO\" (Collect $200).", function() { advance(0);});
communityChestCards[11] = new Card("You are assessed for street repairs. $40 per house. $115 per hotel.", function() { streetrepairs(40, 115);});
communityChestCards[12] = new Card("Go to Jail. Go directly to Jail. Do not pass \"GO\". Do not collect $200.", function() { gotojail();});

// Assigning Chance cards into the list with certain tasks and actions
chanceCards[0] = new Card("Get out of Jail, Free. This card may be kept until needed or traded.", function(p) { p.chanceJailCard=true; updateOwned();});
chanceCards[1] = new Card("Make General Repairs on All Your Property. For each house pay $25. For each hotel $100.", function() { streetrepairs(25, 100);});
chanceCards[2] = new Card("You have been elected president of the SU. Pay each player $50.", function() { payeachplayer(50, 'Chance');});
chanceCards[3] = new Card("Go back three spaces.", function() { gobackthreespaces();});
chanceCards[4] = new Card("Advance to the nearest Food Area. If unowned, you may buy it from the Bank. IF OWNED, throw dice and pay owner a total ten times the amount thrown.", function() { advanceToNearestfoodArea();});
chanceCards[5] = new Card("Advance to the nearest campus. If unowned, you may buy it from the Bank. If OWNED, pay owner twice the rental to which they are otherwise entitled.", function() { advanceToNearestcampus();});
chanceCards[6] = new Card("You failed an exam. Pay resit fees of $15.", function() { subtractamount(15, 'Chance');});
chanceCards[7] = new Card("Take a trip to Glasnevin Campus. If you pass \"GO\" collect $200.", function() { advance(5);});
chanceCards[8] = new Card("Advance to NuBar.", function() { advance(39);});
chanceCards[9] = new Card("Advance to John and Aileen O'Reilly Libary. If you pass \"GO\" collect $200.", function() { advance(24);});
chanceCards[10] = new Card("Your crypto investment matures. Collect $150.", function() { addamount(150, 'Chance');});
chanceCards[11] = new Card("Advance to Larkfield. If you pass \"GO\" collect $200.", function() { advance(11);});
chanceCards[12] = new Card("Go to Jail. Go Directly to Jail. Do not pass \"GO\". Do not collect $200.", function() { gotojail();});

// Game function which controls the whole game
function Game() {
	var dice1;
	var dice2;
	var diceRolled = false;

	var auctionQueue = [];
	var highestbidder;
	var highestbid;
	var currentbidder = 1;
	var auctionproperty;
	// Rolls the dice by randomizing numbers 1-6
	this.rollDice = function() {
		dice1 = Math.floor(Math.random() * 6) + 1;
		dice2 = Math.floor(Math.random() * 6) + 1;
		diceRolled = true;
	};
	// resets dice so it is ready to be re-rolled
	this.resetDice = function() {
		diceRolled = false;
	};

	// next player to roll
	this.next = function() {
		if (!p.human && p.money < 0) {
			p.AI.payDebt();
			// if player has no money, go bankrupt and pay player who made him go bankrupt
			if (p.money < 0) {
				popup("<p>" + p.name + " cannot pay. All properties will be given to " + player[p.creditor].name + ".</p>", game.bankruptcy);
			} else {
				roll();
			}
		} // if player has rolled dice and has not rolled double, play game, else roll dice 
		else if (diceRolled && doublecount === 0) {
			play();
		} else {
			roll();
		}
	};

	this.getDice = function(dice) {
		if (dice === 1) {

			return dice1;
		} else {

			return dice2;
		}

	};


	// when auction queue is equal to 0, return false
	this.auction = function() {
		if (auctionQueue.length === 0) {
			return false;
		}

		index = auctionQueue.shift();

		var pieces = square[index];
		// if the price bid for property is 0 now the owner does not equal 0, place the property for auction
		if (pieces.price === 0 || pieces.owner !== 0) {
			return game.auction();
		}
	
		auctionproperty = index;
		highestbidder = 0;
		highestbid = 0;
		currentbidder = turn + 1;
		// if the current bidder is greater that the player count
		if (currentbidder > pcount) {
			currentbidder -= pcount;
		}

		popup("<div style='font-size: 16px; margin-bottom: 10px;'>Auction <span id='propertyname'></span></div><div>Highest Bid = <span id='highestbid'></span> (<span id='highestbidder'></span>)</div><div><span id='currentbidder'></span>, it is your turn.</div<div><input id='bid' title='Enter an amount to bid" + s.name + ".' style='width: 291px;' /></div><div><input type='button' value='Bid' onclick='game.auctionBid();' title='Place your bid.' /><input type='button' value='Pass' title='Skip bidding.' onclick='game.auctionPass();' /><input type='button' value='Exit Auction' title='Stop bidding.' onclick='if (confirm(\"Are you sure you want to stop bidding?\")) game.auctionExit();' /></div>", "blank");
		// get the property name
		var auctionpropertyname = document.getElementById("propertyname")

		auctionpropertyname.innerHTML= "<a href='javascript:void(0);' onmouseover='showdeed(" + auctionproperty + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>";
		// get the current highest bid
		var highestcurrentbid = document.getElementById("highestbid")

		highestcurrentbid.innerHTML = "0";
		// get the highest bidder
		var highestplayerbidder = document.getElementById("highestbidder")

		highestplayerbidder.innerHTML = "N/A";
		// get the current players bid
		var currentplayerbidder = document.getElementById("currrentbidder")

		currentplayerbidder.innerHTML = player[currentbidder].name;

		//Updating Money on auction finish
		updateMoney();
		// the current bidder in not a human player
		if (!player[currentbidder].human) {
			currentbidder = turn;
			this.auctionPass();
		}
		return true;
	};

	this.auctionBid = function(bid) {
		// get the current bid
		var bidelement = document.getElementById("bid")
		// get the current highest bidder
		var highestplayerbidder = document.getElementById("highestbidder")
		// get the current highest bid
		var highestcurrentbid = document.getElementById("highestbid")

		bid = bid || parseInt(bidelement.value, 10);

		// if bid is not a number, tell user to enter a number
		if (isNaN(bid)) {
			bidelement.value = "Your bid must be a cash amount";
			bidelement.style.color = "red";
		}
		// if bid is empty, tell user to enter a bid
		else if (bid === "" || bid === null) {
			bidelement.value = "Please enter an amount to bid.";
			bidelement.style.color = "red";
		}
		// if the user has bid more than their balance, tell user they can bid that much
		else if (bid > player[currentbidder].money) {
				bidelement.value = "You don't have enough money to bid this amount" + bid + ".";
				bidelement.style.color = "red";
			} // if users bid is higher than current bid, have them as new highest bidder
		else if (bid > highestbid) {
				highestbid = bid;
				highestcurrentbid.innerHTML = parseInt(bid, 10);
				highestbidder = currentbidder;
				highestplayerbidder.innerHTML = player[highestbidder].name;

				bidelement.focus();
				// if they are current highest bidder, pass them through the round
				if (player[currentbidder].human) {
					this.auctionPass();
				}
			}
		else {
				// if user input bid smaller than current bid
				bidelement.value = "Your bid must be more than current highest bid. (" + highestbid + ")";
				bidelement.style.color = "red";
			}
		};


	this.auctionPass = function() {
		// if highest bidder is equal to 0, highest bidder is equal to current bidder
		if (highestbidder === 0) {
			highestbidder = currentbidder;
		}
		// while this statement is true, increment current bidder by 1
		while (true) {
			currentbidder++;

			if (currentbidder > pcount) {
				currentbidder -= pcount;
			}
			// if current bidder is equal to highest bidder, finalize the auction
			if (currentbidder === highestbidder) {
				finalizeAuction();
				return;
			}
			// if the current player is bidding
			else if (player[currentbidder].bidding) {
				var p = player[currentbidder];
				// if the player is not a human player, let AI bid
				if (!p.human) {
					var bid = p.AI.bid(auctionproperty, highestbid);
					// if highest bid is more than players money, exit auction
					if (bid === -1 || highestbid >= p.money) {
						p.bidding = false;

						window.alert(p.name + " has left the auction");
						continue;
						// if player chooses to pass this round of bidding, pass
					} else if (bid === 0) {
						window.alert(p.name + " passed this round of bidding.");
						continue;
						// if player wishes to bid, they bid
					} else if (bid > 0) {
						this.auctionBid(bid);
						window.alert(p.name + " has bid " + bid);
						continue;
					}
					return;
				} else {
					break;
				}
			}

		}

		// exit auction
		this.auctionExit = function() {
			player[currentbidder].bidding = false;
			this.auctionPass();
		};

		// get current players bid
		var currentplayerbidder = document.getElementById("currentbidder")
		currentplayerbidder.innerHTML = player[currentbidder].name
		// get the current bid
		var bidelement = document.getElementById("bid")
		bidelement.value = "";
		bidelement.style.color = "black";
	};

	// sets user to the highest bidder and sq to the property thats being auctioned
	var finalizeAuction = function() {
		var p = player[highestbidder];
		var sq = square[auctionproperty];
		// if highest bid is greater than 0
		if (highestbid > 0) {
			p.pay(highestbid, 0);
			sq.owner = highestbidder;
			addAlert(p.name + " bought " + sq.name + " for " + highestbid);
		}

		// for every player in game, let them bid
		for (var i = 1; i <= pcount; i++) {
			player[i].bidding = true;
		}

		$("#popupbackground").hide();
		$("#popupwrap").hide();
		// if there is no auction, continue playing the game
		if (!game.auction()) {
			play();
		}
	};

	// add a property to auction queue, done when player gone bankrupt not bu paying other user.
	this.addPropertyToAuctionQueue = function(propertyIndex) {
		auctionQueue.push(propertyIndex);
	};


	// Trade Functionality

	var currentTrader;
	var currentReciever;

	// trade buttons which show up and hide as it goes through the trade process
	var tradeMoneyOnChange = function(e) {
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		var amount = this.value;

		amount = Math.round(amount) || 0;
		this.value = amount;

		return true;
	};
	// the trade bar on the left players money and the trade bar on the right players money
	var tradeleftplayermoney = document.getElementById("trade-leftp-money")
	var traderightplayermoney = document.getElementById("trade-rightp-money")

	tradeleftplayermoney.onchange = tradeMoneyOnChange;
	traderightplayermoney.onchange = tradeMoneyOnChange;

	// function that resets the trade each time
	var resetTrade = function(trader, reciever, allowRecieverToBeChanged) {
		var currentSquare;
		var currentTableRow;
		var currentTableCell;
		var currentTableCellCheckbox;
		var nameSelect;
		var currentOption;
		var Unimproved;
		var currentName;
		// when selecting a checkbox on the table
		var tableRowOnClick = function(e) {
			var checkboxElement = this.firstChild.firstChild;

			if (checkboxElement !== e.srcElement) {
				checkboxElement.checked = !checkboxElement.checked;
			}

			$("#proposetradebutton").show();
			$("#canceltradebutton").show();
			$("#accepttradebutton").hide();
			$("#rejecttradebutton").hide();
		};
		// gets the traders properties and the recievers properties
		var traderProperty = document.getElementById("trade-leftp-property");
		var recieverProperty = document.getElementById("trade-rightp-property");

		currentTrader = trader;
		currentReciever = reciever;

		// gets rid of any empty elements on trader view
		while (traderProperty.lastChild) {
			traderProperty.removeChild(traderProperty.lastChild);
		}
		// gets rid of any elements on the reciever view
		while (recieverProperty.lastChild) {
			recieverProperty.removeChild(recieverProperty.lastChild);
		}
		// creting the tables for reciever and trader
		var traderSideTable = document.createElement("table");
		var recieverSideTable = document.createElement("table");

		// for every square on the board
		for (var i = 0; i < 40; i++) {
			currentSquare = square[i];

			// A property cannot be traded if any properties have buildings on them.
			if (currentSquare.house > 0 || currentSquare.groupNum === 0) {
				continue;
			}
			// no buildings on property equals to true
			Unimproved = true;
			var max = currentSquare.group.length;
			for (var j = 0; j < max; j++) {
				// if property has buildings, this is false and cant be traded
				if (square[currentSquare.group[j]].house > 0) {
					Unimproved = false;
					break;
				}
			}

			if (!Unimproved) {
				continue;
			}

			// List of the properties being offered
			if (currentSquare.owner === trader.index) {
				currentTableRow = traderSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;
				// appends a property to the traders side table, which allows it to be selected and offered for a trade
				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "tradeleftcheckbox" + i;
				currentTableCellCheckbox.title = "Check this box to include " + currentSquare.name + " in trade.";
				// shows the color group of the card.
				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentSquare.color;

				if (currentSquare.groupNum === 1 || currentSquare.groupNum === 2) {
					currentTableCell.style.borderColor = "grey";
				}
				else {
					currentTableCell.style.borderColor = currentSquare.color;
				}
				// when hovering on the property, the card will enlarge
				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				// if a property is mortgaged, it will show up as grey.
				if (currentSquare.mortgage) {
					currentTableCell.title = "Mortgaged";
					currentTableCell.style.color = "grey";
				}
				// the text content of the property, is equal to the property name.
				currentTableCell.textContent = currentSquare.name;

			// the list of properties being requested.
			} else if (currentSquare.owner === reciever.index) {
				currentTableRow = recieverSideTable.appendChild(document.createElement("tr"));
				currentTableRow.onclick = tableRowOnClick;
				// appends a property to the recievers side table, which allows it to be selected
				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcheckbox";
				currentTableCellCheckbox = currentTableCell.appendChild(document.createElement("input"));
				currentTableCellCheckbox.type = "checkbox";
				currentTableCellCheckbox.id = "traderightcheckbox" + i;
				currentTableCellCheckbox.title = "Check this box to include " + currentSquare.name + " in trade.";
				// shows the cards color group
				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellcolor";
				currentTableCell.style.backgroundColor = currentSquare.color;

				if (currentSquare.groupNum === 1 || currentSquare.groupNum === 2) {
					currentTableCell.style.borderColor = "grey";
				} else {
					currentTableCell.style.borderColor = currentSquare.color;
				}
				// the card will englare when it is hovered over
				currentTableCell.propertyIndex = i;
				currentTableCell.onmouseover = function() {showdeed(this.propertyIndex);};
				currentTableCell.onmouseout = hidedeed;

				currentTableCell = currentTableRow.appendChild(document.createElement("td"));
				currentTableCell.className = "propertycellname";
				// shows currently mortgaged properties in grey
				if (currentSquare.mortgage) {
					currentTableCell.title = "Mortgaged";
					currentTableCell.style.color = "grey";
				}
				currentTableCell.textContent = currentSquare.name;
			}
		}
		// will add properties to traders side
		if (traderSideTable.lastChild) {
			traderProperty.appendChild(traderSideTable);
		}
		// if they have no properties to trade it will come up here
		else {
			traderProperty.textContent = trader.name + " has no properties available to trade.";
		}
		// will add properties to the recievers side
		if (recieverSideTable.lastChild) {
			recieverProperty.appendChild(recieverSideTable);
		} // if they have no properties to recieve it will come up here 
		else {
			recieverProperty.textContent = reciever.name + " has no properties available to trade.";
		}
		// the traders name on the left shows up in a box
		document.getElementById("trade-leftp-name").textContent = trader.name;
		// the traders name on the right shows up in a box
		currentName = document.getElementById("trade-rightp-name");
		// allows to change person who you want to trade with, as long as theres more than two people.
		if (allowRecieverToBeChanged && pcount > 2) {
			while (currentName.lastChild) {
				currentName.removeChild(currentName.lastChild);
			}
			// allows you to change person here
			nameSelect = currentName.appendChild(document.createElement("select"));
			for (var i = 1; i <= pcount; i++) {
				if (i === trader.index) {
					continue;
				}
				// shows up with the current option of player to trade with
				currentOption = nameSelect.appendChild(document.createElement("option"));
				currentOption.value = i + "";
				currentOption.style.color = player[i].color;
				currentOption.textContent = player[i].name;

				if (i === trader.index) {
					currentOption.selected = "selected";
				}
			}
			// when the name is changed on recievers end, will reset the trade
			nameSelect.onchange = function() {
				resetTrade(currentTrader, player[parseInt(this.value, 10)], true);
			};

			nameSelect.title = "Please select a player that you wish to trade with.";
		} else {
			currentName.textContent = reciever.name;
		}
		// gets the left and rights players money box to trade cash with, automatically set to zero at the start
		var tradeleftplayermoney = document.getElementById("trade-leftp-money")
		var traderightplayermoney = document.getElementById("trade-rightp-money")
		tradeleftplayermoney.value = "0";
		traderightplayermoney.value = "0";

	};
	// reads what the trade is and performs each action that needs to be done
	var readTrade = function() {
		var trader = currentTrader;
		var reciever = currentReciever;
		var property = new Array(40);
		var money;
		for (var i = 0; i < 40; i++) {
			var tradeleftcheckbox = document.getElementById("tradeleftcheckbox" + i)
			var traderightcheckbox = document.getElementById("traderightcheckbox" + i)
			if (tradeleftcheckbox && tradeleftcheckbox.checked) {
				property[i] = 1;
			}
			else if (traderightcheckbox && traderightcheckbox.checked) {
				property[i] = -1;
			}
			else {
				property[i] = 0;
			}
		}

		money = parseInt(document.getElementById("trade-leftp-money").value, 10) || 0;
		money -= parseInt(document.getElementById("trade-rightp-money").value, 10) || 0;

		var trade = new Trade(trader, reciever, money, property);

		return trade;
	};

	var writeTrade = function(tradeObj) {
		var tradeleftplayermoney = document.getElementById("trade-leftp-money")
		var traderightplayermoney = document.getElementById("trade-rightp-money")

		resetTrade(tradeObj.getTrader(), tradeObj.getReciever(), false);

		for (var i = 0; i < 40; i++) {
			var tradeleftcheckbox = document.getElementById("tradeleftcheckbox" + i)
			var traderightcheckbox = document.getElementById("traderightcheckbox" + i)

			if (tradeleftcheckbox) {
				tradeleftcheckbox.checked = tradeObj.getProperty(i) === 1;
			}

			if (traderightcheckbox) {
				traderightcheckbox.checked = tradeObj.getProperty(i) === -1;
			}
		}

		if (tradeObj.getMoney() > 0) {
			tradeleftplayermoney.value = tradeObj.getMoney() + "";
		}
		else {
			traderightplayermoney.value = (-tradeObj.getMoney()) + "";
		}
	};
	// writes out the trade box and hides and shows current items that are needed
	this.trade = function(tradeObj) {
		$("#board").hide();
		$("#control").hide();
		$("#trade").show();
		$("#proposetradebutton").show();
		$("#canceltradebutton").show();
		$("#accepttradebutton").hide();
		$("#rejecttradebutton").hide();

		if (tradeObj instanceof Trade) {
			writeTrade(tradeObj);
			this.proposeTrade();
		} else {
			var trader = player[turn];
			var reciever = turn === 1 ? player[2] : player[1];

			currentTrader = trader;
			currentReciever = reciever;

			resetTrade(trader, reciever, true);
		}
	};

	// allows player to cancel trade if they do not wish to trade
	this.cancelTrade = function() {
		$("#board").show();
		$("#control").show();
		$("#trade").hide();


		if (!player[turn].human) {
			player[turn].AI.alertList = "";
			game.next();
		}

	};
	// allows the player to accept a trade
	this.acceptTrade = function(tradeObj) {
		var tradeleftplayermoney = document.getElementById("trade-leftp-money")
		var traderightplayermoney = document.getElementById("trade-rightp-money")
		// if the input in the money box is not a number, error will show
		if (isNaN(tradeleftplayermoney.value)) {
			tradeleftplayermoney.value = "This value must be a number.";
			tradeleftplayermoney.style.color = "red";
			return false;
		}
		// if the input in the money box is not a number, error will show
		if (isNaN(traderightplayermoney.value)) {
			traderightplayermoney.value = "This value must be a number.";
			traderightplayermoney.style.color = "red";
			return false;
		}
		// show alert to reciving player
		var showAlerts = true;
		var money;
		var trader;
		var reciever;

		if (tradeObj) {
			showAlerts = false;
		} else {
			tradeObj = readTrade();
		}

		money = tradeObj.getMoney();
		trader = tradeObj.getTrader();
		reciever = tradeObj.getReciever();

		// if the player doesn't have the sufficent funds 
		if (money > 0 && money > trader.money) {
			tradeleftplayermoney.value = trader.name + " doesn't have " + money + ".";
			tradeleftplayermoney.style.color = "red";
			return false;
		} // if the player doesn't have the sufficent funds 
		else if (money < 0 && -money > reciever.money) {
			traderightplayermoney.value = reciever.name + " doesn't have " + (-money) + ".";
			traderightplayermoney.style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		// make sure some properties are selected.
		for (var i = 0; i < 40; i++) {
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		// if player has not selected any properties, they will be told.
		if (isAPropertySelected === 0) {
			popup("<p>you must select at least one property in order to trade.</p>");

			return false;
		}

		if (showAlerts && !confirm(trader.name + ", are you sure you want to make this trade with " + reciever.name + "?")) {
			return false;
		}

		// exchange the properties that were selected for trade
		for (var i = 0; i < 40; i++) {

			if (tradeObj.getProperty(i) === 1) {
				square[i].owner = reciever.index;
				addAlert(reciever.name + " has got " + square[i].name + " from " + trader.name + ".");
			} else if (tradeObj.getProperty(i) === -1) {
				square[i].owner = trader.index;
				addAlert(trader.name + " has got " + square[i].name + " from " + reciever.name + ".");
			}

		}

		// exchange the cash that was decieded upon
		if (money > 0) {
			trader.pay(money, reciever.index);
			reciever.money += money;

			addAlert(reciever.name + " has got " + money + " from " + trader.name + ".");
		} else if (money < 0) {
			money = -money;

			reciever.pay(money, trader.index);
			reciever.money += money;

			addAlert(trader.name + " has got " + money + " from " + reciever.name + ".");
		}
		// update each players owned properties and update cash balance
		updateOwned();
		updateMoney();
		// show control box and board again
		$("#board").show();
		$("#control").show();
		$("#trade").hide();

		if (!player[turn].human) {
			player[turn].AI.alertList = "";
			game.next();
		}
	};
	// allows user to propose a trade
	this.proposeTrade = function() {
		var tradeleftplayermoney = document.getElementById("trade-leftp-money")
		var traderightplayermoney = document.getElementById("trade-rightp-money")
		// if input in money box is not a number , throw error
		if (isNaN(tradeleftplayermoney.value)) {
			tradeleftplayermoney.value = "This value must be a number.";
			tradeleftplayermoney.style.color = "red";
			return false;
		}
		// if input in money box is not a number , throw error
		if (isNaN(traderightplayermoney.value)) {
			traderightplayermoney.value = "This value must be a number.";
			traderightplayermoney.style.color = "red";
			return false;
		}

		var tradeObj = readTrade();
		var money = tradeObj.getMoney();
		var trader = tradeObj.getTrader();
		var reciever = tradeObj.getReciever();
		var reversedTradeProperty = [];
		// if player has insufficent funds, throw error
		if (money > 0 && money > trader.money) {
			tradeleftplayermoney.value = trader.name + " doesn't" + money + ".";
			tradeleftplayermoney.style.color = "red";
			return false;
		}
		// if player has insufficent funds, throw error
		else if (money < 0 && -money > reciever.money) {
			traderightplayermoney.value = reciever.name + " does't" + (-money) + ".";
			traderightplayermoney.style.color = "red";
			return false;
		}

		var isAPropertySelected = 0;

		
		for (var i = 0; i < 40; i++) {
			reversedTradeProperty[i] = -tradeObj.getProperty(i);
			isAPropertySelected |= tradeObj.getProperty(i);
		}

		// if user has not selected any properties, throw an error
		if (isAPropertySelected === 0) {
			popup("<p>you must select at least one property in order to trade</p>");

			return false;
		}
		// confirms that if you want to confirm this trade or not
		if (trader.human && !confirm(trader.name + ", are you sure you want to make this offer ?")) {
			return false;
		}

		var reversedTrade = new Trade(reciever, trader, -money, reversedTradeProperty);
		// if the reciever is a human
		if (reciever.human) {

			writeTrade(reversedTrade);

			$("#proposetradebutton").hide();
			$("#canceltradebutton").hide();
			$("#accepttradebutton").show();
			$("#rejecttradebutton").show();
			// alerts players that a trade has started
			addAlert(trader.name + " has started a trade with" + reciever.name + ".");
			popup("<p>" + trader.name + " has offered a trade to you, " + reciever.name + ". You can accept, reject, or propose a counteroffer to the offer.</p>");
		} 
	};

// bankruptcy, will eliminate player if gone bankrupt, eg. has no money and properties
	this.eliminatePlayer = function() {
		var p = player[turn];
		// will take away player from player count.
		for (var i = p.index; i < pcount; i++) {
			player[i] = player[i + 1];
			player[i].index = i;

		}
		// will take away any property owned by eliminated player when they are eliminated.
		for (var i = 0; i < 40; i++) {
			if (square[i].owner >= p.index) {
				square[i].owner--;
			}
		}

		pcount--;
		turn--;
		// if there are only 2 players left, resize stats window, the same for if there are 3 players left.
		if (pcount === 2) {
			document.getElementById("stats").style.width = "454px";
		} else if (pcount === 3) {
			document.getElementById("stats").style.width = "686px";
		}
		// if there is only one player left, let them know they won the game.
		if (pcount === 1) {
			updateMoney();
			$("#control").hide();
			$("#board").hide();
			$("#refresh").show();

			popup("<p>Congratulations, " + player[1].name + ", you won the game.</p><div>");

		} else {
			play();
		}
	};

	// When inherited property through bankruptcy, will give you instructions of what you can do
	this.bankruptcyUnmortgage = function() {
		var p = player[turn];
		// if the player does not credit anyone with property, eliminate player immediately
		if (p.creditor === 0) {
			game.eliminatePlayer();
			return;
		}
		// tells the person who inherited the properties that they can unmortgage properties
		var HTML = "<p>" + player[p.creditor].name + ", you can unmortgage any of the properties, interest free, by clicking on them.</p><table>";
		var price;

		// the price of unmortgage each property
		for (var i = 0; i < 40; i++) {
			sq = square[i];
			if (sq.owner == p.index && sq.mortgage) {
				price = Math.round(sq.price * 0.5);

				HTML += "<tr><td class='propertycellcolor' style='background: " + sq.color + ";";

				if (sq.groupNum == 1 || sq.groupNum == 2) {
					HTML += " border: 1px solid grey;";
				} else {
					HTML += " border: 1px solid " + sq.color + ";";
				}

				// the player has already paid interest, so they can unmortgage for the unmortgage price.
				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname'><a href='javascript:void(0);' title='Unmortgage " + sq.name + " for " + price + ".' onclick='if (" + price + " <= player[" + p.creditor + "].money) {player[" + p.creditor + "].pay(" + price + ", 0); square[" + i + "].mortgage = false; addAlert(\"" + player[p.creditor].name + " unmortgaged " + sq.name + " for " + price + ".\");} this.parentElement.parentElement.style.display = \"none\";'>Unmortgage " + sq.name + " (" + price + ")</a></td></tr>";

				sq.owner = p.creditor;

			}
		}

		HTML += "</table>";

		popup(HTML, game.eliminatePlayer);
	};
	// will ask to make sure you want to leave the game and go bankrupt.
	this.resign = function() {
		popup("<p>Are you sure you want to resign?</p>", game.bankruptcy, "Yes/No");
	};
	// when going bankrupt this function will run
	this.bankruptcy = function() {
		var p = player[turn];
		var pcredit = player[p.creditor];
		var bankruptcyUnmortgageFee = 0;


		if (p.money >= 0) {
			return;
		}
		// alerting players that a player has gone bankrupt
		addAlert(p.name + " has gone bankrupt.");
		// if the creditor does not equal 0, credit them with the money
		if (p.creditor !== 0) {
			pcredit.money += p.money;
		}
		// for each tile on the board
		for (var i = 0; i < 40; i++) {
			sq = square[i];
			if (sq.owner == p.index) {
				// properties will be passed through function bankruptcyUnmortgage;
				if (!sq.mortgage) {
					sq.owner = p.creditor;
				} else {
					bankruptcyUnmortgageFee += Math.round(sq.price * 0.1);
				}

				if (sq.house > 0) {
					if (p.creditor !== 0) {
						pcredit.money += sq.houseprice * 0.5 * sq.house;
					}
					sq.hotel = 0;
					sq.house = 0;
				}
				// will add property to an auction if not inherited.
				if (p.creditor === 0) {
					sq.mortgage = false;
					game.addPropertyToAuctionQueue(i);
					sq.owner = 0;
				}
			}
		}

		updateMoney();
		// if they had a get out of jail free card, the player will recieve it
		if (p.chanceJailCard) {
			p.chanceJailCard = false;
			pcredit.chanceJailCard = true;
		}

		if (p.communityChestJailCard) {
			p.communityChestJailCard = false;
			pcredit.communityChestJailCard = true;
		}

		if (pcount === 2 || bankruptcyUnmortgageFee === 0 || p.creditor === 0) {
			game.eliminatePlayer();
		} else {
			addAlert(pcredit.name + " has paid " + bankruptcyUnmortgageFee + " interest on the mortgaged properties they got from " + p.name + ".");
			popup("<p>" + pcredit.name + ", you have to pay " + bankruptcyUnmortgageFee + " interest on the mortgaged properties you have got from " + p.name + ".</p>", function() {player[pcredit.index].pay(bankruptcyUnmortgageFee, 0); game.bankruptcyUnmortgage();});
		}
	};

}

var game;

// player function which will assign players with a name, color, amount of money etc.
function Player(name, color) {
	this.name = name;
	this.color = color;
	this.position = 0;
	this.money = 1500;
	this.creditor = -1;
	this.jail = false;
	this.jailroll = 0;
	this.communityChestJailCard = false;
	this.chanceJailCard = false;
	this.bidding = true;
	this.human = true;

	// pay for property
	this.pay = function (amount, creditor) {
		if (amount <= this.money) {
			this.money -= amount;

			updateMoney();

			return true;
		} // pay another player due to rent etc. 
		else {
			this.money -= amount;
			this.creditor = creditor;

			updateMoney();

			return false;
		}
	};
}


function Trade(trader, reciever, money, property) {

	this.getTrader = function() {
		return trader;
	};

	this.getReciever = function() {
		return reciever;
	};

	this.getProperty = function(index) {
		return property[index];
	};

	this.getMoney = function() {
		return money;
	};
}

var player = [];
var pcount;
var turn = 0, doublecount = 0;
// Overwrite an array with numbers from 1-array's length randomly.
Array.prototype.randomize = function(length) {
	length = (length || this.length);
	var num;
	var indexArray = [];

	for (var i = 0; i < length; i++) {
		indexArray[i] = i;
	}

	for (var i = 0; i < length; i++) {
		// Generate random number from 0-length of array - 1.
		num = Math.floor(Math.random() * indexArray.length);
		this[i] = indexArray[num] + 1;

		indexArray.splice(num, 1);
	}
};


function addAlert(alertText) {
	$alert = $("#alert");

	$(document.createElement("div")).text(alertText).appendTo($alert);

	// Animate scrolling down.
	$alert.stop().animate({"scrollTop": $alert.prop("scrollHeight")}, 1000);

	if (!player[turn].human) {
		player[turn].AI.alertList += "<div>" + alertText + "</div>";
	}
}

function popup(HTML, action, option) {
	document.getElementById("popuptext").innerHTML = HTML;
	document.getElementById("popup").style.width = "300px";
	document.getElementById("popup").style.top = "0px";
	document.getElementById("popup").style.left = "0px";

	if (!option && typeof action === "string") {
		option = action;
	}

	option = option ? option.toLowerCase() : "";

	if (typeof action !== "function") {
		action = null;
	}

	// option either yes or no
	if (option === "yes/no") {
		document.getElementById("popuptext").innerHTML += "<div><input type=\"button\" value=\"Yes\" id=\"popupyes\" /><input type=\"button\" value=\"No\" id=\"popupno\" /></div>";

		$("#popupyes, #popupno").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		});

		$("#popupyes").on("click", action);

	// option is ok
	} else if (option !== "blank") {
		$("#popuptext").append("<div><input type='button' value='OK' id='popupclose' /></div>");
		$("#popupclose").focus();

		$("#popupclose").on("click", function() {
			$("#popupwrap").hide();
			$("#popupbackground").fadeOut(400);
		}).on("click", action);

	}

	// uses animation to display.
	$("#popupbackground").fadeIn(400, function() {
		$("#popupwrap").show();
	});

}


function updatePosition() {
	// Reset the borders
	document.getElementById("jail").style.border = "1px solid black";
	document.getElementById("jailpositionholder").innerHTML = "";
	for (var i = 0; i < 40; i++) {
		document.getElementById("cell" + i).style.border = "1px solid black";
		document.getElementById("cell" + i + "positionholder").innerHTML = "";

	}

	var sq, left, top;

	for (var x = 0; x < 40; x++) {
		sq = square[x];
		left = 0;
		top = 0;

		for (var y = turn; y <= pcount; y++) {

			if (player[y].position == x && !player[y].jail) {
				// updates the cell with color of player
				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}

		for (var y = 1; y < turn; y++) {
			// updates the cell with color of player
			if (player[y].position == x && !player[y].jail) {
				document.getElementById("cell" + x + "positionholder").innerHTML += "<div class='cell-position' title='" + player[y].name + "' style='background-color: " + player[y].color + "; left: " + left + "px; top: " + top + "px;'></div>";
				if (left == 36) {
					left = 0;
					top = 12;
				} else
					left += 12;
			}
		}
	}
	// if player is in jail
	left = 0;
	top = 53;
	for (var i = turn; i <= pcount; i++) {
		if (player[i].jail) {
			document.getElementById("jailpositionholder").innerHTML += "<div class='cell-position' title='" + player[i].name + "' style='background-color: " + player[i].color + "; left: " + left + "px; top: " + top + "px;'></div>";

			if (left === 36) {
				left = 0;
				top = 41;
			} else {
				left += 12;
			}
		}
	}

	for (var i = 1; i < turn; i++) {
		if (player[i].jail) {
			document.getElementById("jailpositionholder").innerHTML += "<div class='cell-position' title='" + player[i].name + "' style='background-color: " + player[i].color + "; left: " + left + "px; top: " + top + "px;'></div>";
			if (left === 36) {
				left = 0;
				top = 41;
			} else
				left += 12;
		}
	}

	p = player[turn];
	// changes color of border to player color
	if (p.jail) {
		document.getElementById("jail").style.border = "1px solid " + p.color;
	} else {
		document.getElementById("cell" + p.position).style.border = "1px solid " + p.color;
	}

}

// function that updates players money when they buy, sell or recieve money
function updateMoney() {
	var p = player[turn];

	document.getElementById("pmoney").innerHTML = "$" + p.money;
	$(".money-bar-row").hide();

	for (var i = 1; i <= pcount; i++) {
		p_i = player[i];

		$("#moneybarrow" + i).show();
		document.getElementById("p" + i + "moneybar").style.border = "2px solid " + p_i.color;
		document.getElementById("p" + i + "money").innerHTML = p_i.money;
		document.getElementById("p" + i + "moneyname").innerHTML = p_i.name;
	}

	if (document.getElementById("landed").innerHTML === "") {
		$("#landed").hide();
	}

	document.getElementById("quickstats").style.borderColor = p.color;

	// if player has no money, show to resign button, else show the next button
	if (p.money < 0) {
		$("#resignbutton").show();
		$("#nextbutton").hide();
	} else {
		$("#resignbutton").hide();
		$("#nextbutton").show();
	}
}
// updates dice after every roll
function updateDice() {
	var dice0 = game.getDice(1);
	var dice1 = game.getDice(2);

	$("#die0").show();
	$("#die1").show();

	if (document.images) {
		var element0 = document.getElementById("die0");
		var element1 = document.getElementById("die1");

		element0.classList.remove("die-no-img");
		element1.classList.remove("die-no-img");

		element0.title = "Die (" + dice0 + " spots)";
		element1.title = "Die (" + dice1 + " spots)";

		if (element0.firstChild) {
			element0 = element0.firstChild;
		} else {
			element0 = element0.appendChild(document.createElement("img"));
		}

		element0.src = "/static/images/Dice_" + dice0 + ".png";
		element0.alt = dice0;

		if (element1.firstChild) {
			element1 = element1.firstChild;
		} else {
			element1 = element1.appendChild(document.createElement("img"));
		}

		element1.src = "static/images/Dice_" + dice1 + ".png";
		element1.alt = dice0;
	} else {
		document.getElementById("die0").textContent = dice0;
		document.getElementById("die1").textContent = dice1;

		document.getElementById("die0").title = "Dice";
		document.getElementById("die1").title = "Dice";
	}
}

// update the properties to the players who own them when bought
function updateOwned() {
	var p = player[turn];
	var checkedproperty = getCheckedProperty();
	$("#option").show();
	$("#owned").show();

	var HTML = "",
	firstproperty = -1;

	var mortgagetext = "",
	housetext = "";
	var sq;
	// show who owns what property
	for (var i = 0; i < 40; i++) {
		sq = square[i];
		if (sq.groupNum && sq.owner === 0) {
			$("#cell" + i + "owner").hide();
		} else if (sq.groupNum && sq.owner > 0) {
			var currentCellOwner = document.getElementById("cell" + i + "owner");

			currentCellOwner.style.display = "block";
			currentCellOwner.style.backgroundColor = player[sq.owner].color;
			currentCellOwner.title = player[sq.owner].name;
		}
	}

	for (var i = 0; i < 40; i++) {
		sq = square[i];
		if (sq.owner == turn) {
			// if property is mortgaged, change color of card name to grey in name
			mortgagetext = "";
			if (sq.mortgage) {
				mortgagetext = "title='Mortgaged' style='color: grey;'";
			}
			// if player buys house, it will add house to property and display it in stats screen, will build hotel if player has 4 houses
			housetext = "";
			if (sq.house >= 1 && sq.house <= 4) {
				for (var x = 1; x <= sq.house; x++) {
					housetext += "<img src='/static/images/house.png' alt='' title='House' class='house' />";
				}
			} else if (sq.hotel) {
				housetext += "<img src='static/images/hotel.png' alt='' title='Hotel' class='hotel' />";
			}

			if (HTML === "") {
				HTML += "<table>";
				firstproperty = i;
			}

			HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox" + i + "' /></td><td class='propertycellcolor' style='background: " + sq.color + ";";

			if (sq.groupNum == 1 || sq.groupNum == 2) {
				HTML += " border: 1px solid grey; width: 18px;";
			}

			HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='propertycellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
		}
	}

	if (p.communityChestJailCard) {
		if (HTML === "") {
			firstproperty = 40;
			HTML += "<table>";
		}
		HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox40' /></td><td class='propertycellcolor' style='background: white;'></td><td class='propertycellname'>Get Out of Jail Free Card</td></tr>";

	}
	if (p.chanceJailCard) {
		if (HTML === "") {
			firstproperty = 41;
			HTML += "<table>";
		}
		HTML += "<tr class='property-cell-row'><td class='propertycellcheckbox'><input type='checkbox' id='propertycheckbox41' /></td><td class='propertycellcolor' style='background: white;'></td><td class='propertycellname'>Get Out of Jail Free Card</td></tr>";
	}

	if (HTML === "") {
		HTML = p.name + ", you have no properties.";
		$("#option").hide();
	} else {
		HTML += "</table>";
	}

	document.getElementById("owned").innerHTML = HTML;

	// select the property that was previously selected.
	if (checkedproperty > -1 && document.getElementById("propertycheckbox" + checkedproperty)) {
		document.getElementById("propertycheckbox" + checkedproperty).checked = true;
	} else if (firstproperty > -1) {
		document.getElementById("propertycheckbox" + firstproperty).checked = true;
	}
	$(".property-cell-row").click(function() {
		var row = this;

		// toggle check on the current select box.
		$(this).find(".propertycellcheckbox > input").prop("checked", function(index, val) {
			return !val;
		});

		// have all other checkboxes to false or empty
		$(".propertycellcheckbox > input").prop("checked", function(index, val) {
			if (!$.contains(row, this)) {
				return false;
			}
		});

		updateOption();
	});
	updateOption();
}

function updateOption() {
	$("#option").show();

	var Unimproved = true;
	var allGroupUnmortgaged = true;
	var checkedproperty = getCheckedProperty();

	if (checkedproperty < 0 || checkedproperty >= 40) {
		$("#buyhousebutton").hide();
		$("#sellhousebutton").hide();
		$("#mortgagebutton").hide();


		var sumHouse = 32;
		var sumHotel = 12;

		for (var i = 0; i < 40; i++) {
			s = square[i];
			if (s.hotel == 1)
				sumHotel--;
			else
				sumHouse -= s.house;
		}

		$("#buildings").show();
		document.getElementById("buildings").innerHTML = "<img src='static/images/house.png' alt='' title='House' class='house' />:&nbsp;" + sumHouse + "&nbsp;&nbsp;<img src='static/images/hotel.png' alt='' title='Hotel' class='hotel' />:&nbsp;" + sumHotel;

		return;
	}

	$("#buildings").hide();
	var sq = square[checkedproperty];

	buyhousebutton = document.getElementById("buyhousebutton");
	sellhousebutton = document.getElementById("sellhousebutton");

	$("#mortgagebutton").show();
	document.getElementById("mortgagebutton").disabled = false;

	if (sq.mortgage) {
		document.getElementById("mortgagebutton").value = "Unmortgage (" + Math.round(sq.price * 0.55) + ")";
		document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for " + Math.round(sq.price * 0.55) + ".";
		$("#buyhousebutton").hide();
		$("#sellhousebutton").hide();

		allGroupUnmortgaged = false;
	} else {
		document.getElementById("mortgagebutton").value = "Mortgage (" + (sq.price * 0.5) + ")";
		document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for " + (sq.price * 0.5) + ".";

		if (sq.groupNum >= 3) {
			$("#buyhousebutton").show();
			$("#sellhousebutton").show();
			buyhousebutton.disabled = false;
			sellhousebutton.disabled = false;

			buyhousebutton.value = "Buy a house (" + sq.houseprice + ")";
			sellhousebutton.value = "Sell a house (" + (sq.houseprice * 0.5) + ")";
			buyhousebutton.title = "Buy a house for " + sq.houseprice;
			sellhousebutton.title = "Sell a house for " + (sq.houseprice * 0.5);

			if (sq.house == 4) {
				buyhousebutton.value = "Buy a hotel (" + sq.houseprice + ")";
				buyhousebutton.title = "Buy a hotel for " + sq.houseprice;
			}
			if (sq.hotel == 1) {
				$("#buyhousebutton").hide();
				sellhousebutton.value = "Sell s hotel (" + (sq.houseprice * 0.5) + ")";
				sellhousebutton.title = "Sell a hotel for " + (sq.houseprice * 0.5);
			}

			var maxhouse = 0;
			var minhouse = 5;

			for (var j = 0; j < max; j++) {

				if (square[currentSquare.group[j]].house > 0) {
					Unimproved = false;
					break;
				}
			}

			var max = sq.group.length;
			for (var i = 0; i < max; i++) {
				s = square[sq.group[i]];

				if (s.owner !== sq.owner) {
					buyhousebutton.disabled = true;
					sellhousebutton.disabled = true;
					buyhousebutton.title = "Before buying a house, you have to own all properties in this color group.";
				} else {

					if (s.house > maxhouse) {
						maxhouse = s.house;
					}

					if (s.house < minhouse) {
						minhouse = s.house;
					}

					if (s.house > 0) {
						Unimproved = false;
					}

					if (s.mortgage) {
						allGroupUnmortgaged = false;
					}
				}
			}

			if (!allGroupUnmortgaged) {
				buyhousebutton.disabled = true;
				buyhousebutton.title = "Before buying a house, you have to own all properties in this color group.";
			}

			if (sq.house > minhouse) {
				buyhousebutton.disabled = true;

				if (sq.house == 1) {
					buyhousebutton.title = "Before buying another house, all properties in this color group have to have a house.";
				} else if (sq.house == 4) {
					buyhousebutton.title = "Before buying a hotel, all properties in this color group have to have 4 houses.";
				} else {
					buyhousebutton.title = "Before buying a house, all properties in this color group have to have " + sq.house + " houses.";
				}
			}
			if (sq.house < maxhouse) {
				sellhousebutton.disabled = true;

				if (sq.house == 1) {
					sellhousebutton.title = "Before selling a house, all properties in this color group have to have a house.";
				} else {
					sellhousebutton.title = "Before selling a house, all properties in this color group have to have " + sq.house + " houses.";
				}
			}

			if (sq.house === 0 && sq.hotel === 0) {
				$("#sellhousebutton").hide();

			} else {
				$("#mortgagebutton").hide();

			}

			if (!Unimproved) {
				document.getElementById("mortgagebutton").title = "Before mortgaging a property, all the properties have to have no buildings on them.";
				document.getElementById("mortgagebutton").disabled = true;
			}

		} else {
			$("#buyhousebutton").hide();
			$("#sellhousebutton").hide();
		}
	}
}

function chanceCommunityChest() {
	var p = player[turn];

	if (p.position === 2 || p.position === 17 || p.position === 33) {
		var communityChestIndex = communityChestCards.deck[communityChestCards.index];

		if (communityChestIndex === 0) {
			communityChestCards.deck.splice(communityChestCards.index, 1);
		}

		popup("<img src='static/images/community_chest_icon.png' style='height: 50px; width: 53px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Community Chest:</div><div style='text-align: justify;'>" + communityChestCards[communityChestIndex].text + "</div>", function() {
			communityChestAction(communityChestIndex);
		});

		communityChestCards.index++;

		if (communityChestCards.index >= communityChestCards.deck.length) {
			communityChestCards.index = 0;
		}


	} else if (p.position === 7 || p.position === 22 || p.position === 36) {
		var chanceIndex = chanceCards.deck[chanceCards.index];


		if (chanceIndex === 0) {
			chanceCards.deck.splice(chanceCards.index, 1);
		}

		popup("<img src='static/images/chance_icon.png' style='height: 50px; width: 26px; float: left; margin: 8px 8px 8px 0px;' /><div style='font-weight: bold; font-size: 16px; '>Chance:</div><div style='text-align: justify;'>" + chanceCards[chanceIndex].text + "</div>", function() {
			chanceAction(chanceIndex);
		});

		chanceCards.index++;

		if (chanceCards.index >= chanceCards.deck.length) {
			chanceCards.index = 0;
		}
	} else {
		if (!p.human) {
			p.AI.alertList = "";

			if (!p.AI.onLand()) {
				game.next();
			}
		}
	}
}

function chanceAction(chanceIndex) {
	var p = player[turn];

	chanceCards[chanceIndex].action(p);

	updateMoney();

	if (chanceIndex !== 15 && !p.human) {
		p.AI.alertList = "";
		game.next();
	}
}

function communityChestAction(communityChestIndex) {
	var p = player[turn];

	communityChestCards[communityChestIndex].action(p);

	updateMoney();

	if (communityChestIndex !== 15 && !p.human) {
		p.AI.alertList = "";
		game.next();
	}
}

function addamount(amount, cause) {
	var p = player[turn];

	p.money += amount;

	addAlert(p.name + " has got " + amount + " from " + cause + ".");
}

function subtractamount(amount, cause) {
	var p = player[turn];

	p.pay(amount, 0);

	addAlert(p.name + " lost " + amount + " from " + cause + ".");
}

function gotojail() {
	var p = player[turn];
	addAlert(p.name + " was sent straight to jail.");
	document.getElementById("landed").innerHTML = "You are in jail.";

	p.jail = true;
	doublecount = 0;

	document.getElementById("nextbutton").value = "End turn";
	document.getElementById("nextbutton").title = "End turn";

	if (p.human) {
		document.getElementById("nextbutton").focus();
	}

	updatePosition();
	updateOwned();

	if (!p.human) {
		popup(p.AI.alertList, game.next);
		p.AI.alertList = "";
	}
}

function gobackthreespaces() {
	var p = player[turn];

	p.position -= 3;

	land();
}

function payeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			player[i].money += amount;
			total += amount;
			creditor = p.money >= 0 ? i : creditor;

			p.pay(amount, creditor);
		}
	}

	addAlert(p.name + " lost " + total + " from " + cause + ".");
}

function collectfromeachplayer(amount, cause) {
	var p = player[turn];
	var total = 0;

	for (var i = 1; i <= pcount; i++) {
		if (i != turn) {
			money = player[i].money;
			if (money < amount) {
				p.money += money;
				total += money;
				player[i].money = 0;
			} else {
				player[i].pay(amount, turn);
				p.money += amount;
				total += amount;
			}
		}
	}

	addAlert(p.name + " has got " + total + " from " + cause + ".");
}

function advance(destination, pass) {
	var p = player[turn];

	if (typeof pass === "number") {
		if (p.position < pass) {
			p.position = pass;
		} else {
			p.position = pass;
			p.money += 200;
			addAlert(p.name + " got 200 for passing GO.");
		}
	}
	if (p.position < destination) {
		p.position = destination;
	} else {
		p.position = destination;
		p.money += 200;
		addAlert(p.name + " got 200 for passing GO.");
	}

	land();
}

function advanceToNearestfoodArea() {
	var p = player[turn];

	if (p.position < 12) {
		p.position = 12;
	} else if (p.position >= 12 && p.position < 28) {
		p.position = 28;
	} else if (p.position >= 28) {
		p.position = 12;
		p.money += 200;
		addAlert(p.name + " got 200 for passing GO.");
	}

	land(true);
}

function advanceToNearestcampus() {
	var p = player[turn];

	updatePosition();

	if (p.position < 15) {
		p.position = 15;
	} else if (p.position >= 15 && p.position < 25) {
		p.position = 25;
	} else if (p.position >= 35) {
		p.position = 5;
		p.money += 200;
		addAlert(p.name + " got 200 for passing GO.");
	}

	land(true);
}

function streetrepairs(houseprice, hotelprice) {
	var cost = 0;
	for (var i = 0; i < 40; i++) {
		var s = square[i];
		if (s.owner == turn) {
			if (s.hotel == 1)
				cost += hotelprice;
			else
				cost += s.house * houseprice;
		}
	}

	var p = player[turn];

	if (cost > 0) {
		p.pay(cost, 0);

		if (houseprice === 40) {
			addAlert(p.name + " lost " + cost + " to Community Chest.");
		} else {
			addAlert(p.name + " lost " + cost + " to Chance.");
		}
	}

}

function payfifty() {
	var p = player[turn];

	document.getElementById("jail").style.border = '1px solid black';
	document.getElementById("cell11").style.border = '2px solid ' + p.color;

	$("#landed").hide();
	doublecount = 0;

	p.jail = false;
	p.jailroll = 0;
	p.position = 10;
	p.pay(50, 0);

	addAlert(p.name + " paid the $50 to leave jail.");
	updateMoney();
	updatePosition();
}

function useJailCard() {
	var p = player[turn];

	document.getElementById("jail").style.border = '1px solid black';
	document.getElementById("cell11").style.border = '2px solid ' + p.color;

	$("#landed").hide();
	p.jail = false;
	p.jailroll = 0;

	p.position = 10;

	doublecount = 0;

	if (p.communityChestJailCard) {
		p.communityChestJailCard = false;

		communityChestCards.deck.splice(communityChestCards.index, 0, 0);

		communityChestCards.index++;

		if (communityChestCards.index >= communityChestCards.deck.length) {
			communityChestCards.index = 0;
		}
	} else if (p.chanceJailCard) {
		p.chanceJailCard = false;

		chanceCards.deck.splice(chanceCards.index, 0, 0);

		chanceCards.index++;

		if (chanceCards.index >= chanceCards.deck.length) {
			chanceCards.index = 0;
		}
	}

	addAlert(p.name + " used a \"Get Out of Jail Free\" card.");
	updateOwned();
	updatePosition();
}

function buyHouse(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var sumHouse = 0;
	var sumHotel = 0;

	if (p.money - sq.houseprice < 0) {
		if (sq.house == 4) {
			return false;
		} else {
			return false;
		}

	} else {
		for (var i = 0; i < 40; i++) {
			if (square[i].hotel === 1) {
				sumHotel++;
			} else {
				sumHouse += square[i].house;
			}
		}

		if (sq.house < 4) {
			if (sumHouse >= 32) {
				return false;

			} else {
				sq.house++;
				addAlert(p.name + " built a house on " + sq.name + ".");
			}

		} else {
			if (sumHotel >= 12) {
				return;

			} else {
				sq.house = 5;
				sq.hotel = 1;
				addAlert(p.name + " built a hotel on " + sq.name + ".");
			}
		}

		p.pay(sq.houseprice, 0);

		updateOwned();
		updateMoney();
	}
}

function sellHouse(index) {
	sq = square[index];
	p = player[sq.owner];

	if (sq.hotel === 1) {
		sq.hotel = 0;
		sq.house = 4;
		addAlert(p.name + " sold a hotel on " + sq.name + ".");
	} else {
		sq.house--;
		addAlert(p.name + " sold a house on " + sq.name + ".");
	}

	p.money += sq.houseprice * 0.5;
	updateOwned();
	updateMoney();
}

function showStats() {
	var HTML, sq, p;
	var mortgagetext,
	housetext;
	var write;
	HTML = "<table align='center'><tr>";

	for (var x = 1; x <= pcount; x++) {
		write = false;
		p = player[x];
		if (x == 5) {
			HTML += "</tr><tr>";
		}
		HTML += "<td class='statscell' id='statscell" + x + "' style='border: 2px solid " + p.color + "' ><div class='statsplayername'>" + p.name + "</div>";

		for (var i = 0; i < 40; i++) {
			sq = square[i];

			if (sq.owner == x) {
				mortgagetext = "",
				housetext = "";

				if (sq.mortgage) {
					mortgagetext = "title='Mortgaged' style='color: grey;'";
				}

				if (!write) {
					write = true;
					HTML += "<table>";
				}

				if (sq.house == 5) {
					housetext += "<span style='float: right; font-weight: bold;'>1&nbsp;x&nbsp;<img src='static/images/hotel.png' alt='' title='Hotel' class='hotel' style='float: none;' /></span>";
				} else if (sq.house > 0 && sq.house < 5) {
					housetext += "<span style='float: right; font-weight: bold;'>" + sq.house + "&nbsp;x&nbsp;<img src='static/images/house.png' alt='' title='House' class='house' style='float: none;' /></span>";
				}

				HTML += "<tr><td class='statscellcolor' style='background: " + sq.color + ";";

				if (sq.groupNum == 1 || sq.groupNum == 2) {
					HTML += " border: 1px solid grey;";
				}

				HTML += "' onmouseover='showdeed(" + i + ");' onmouseout='hidedeed();'></td><td class='statscellname' " + mortgagetext + ">" + sq.name + housetext + "</td></tr>";
			}
		}

		if (p.communityChestJailCard) {
			if (!write) {
				write = true;
				HTML += "<table>";
			}
			HTML += "<tr><td class='statscellcolor'></td><td class='statscellname'>Get Out of Jail Free Card</td></tr>";

		}
		if (p.chanceJailCard) {
			if (!write) {
				write = true;
				HTML += "<table>";
			}
			HTML += "<tr><td class='statscellcolor'></td><td class='statscellname'>Get Out of Jail Free Card</td></tr>";

		}

		if (!write) {
			HTML += p.name + " has no properties.";
		} else {
			HTML += "</table>";
		}

		HTML += "</td>";
	}
	HTML += "</tr></table><div id='titledeed'></div>";

	document.getElementById("statstext").innerHTML = HTML;

	$("#statsbackground").fadeIn(400, function() {
		$("#statswrap").show();
	});
}

function showdeed(property) {
	var sq = square[property];
	$("#deed").show();

	$("#deed-normal").hide();
	$("#deed-mortgaged").hide();
	$("#deed-special").hide();

	if (sq.mortgage) {
		$("#deed-mortgaged").show();
		document.getElementById("deed-mortgaged-name").textContent = sq.name;
		document.getElementById("deed-mortgaged-mortgage").textContent = (sq.price / 2);

	} else {

		if (sq.groupNum >= 3) {
			$("#deed-normal").show();
			document.getElementById("deed-header").style.backgroundColor = sq.color;
			document.getElementById("deed-name").textContent = sq.name;
			document.getElementById("deed-baserent").textContent = sq.baserent;
			document.getElementById("deed-rent1").textContent = sq.level1;
			document.getElementById("deed-rent2").textContent = sq.level2;
			document.getElementById("deed-rent3").textContent = sq.level3;
			document.getElementById("deed-rent4").textContent = sq.level4;
			document.getElementById("deed-rent5").textContent = sq.level5;
			document.getElementById("deed-mortgage").textContent = (sq.price / 2);
			document.getElementById("deed-houseprice").textContent = sq.houseprice;
			document.getElementById("deed-hotelprice").textContent = sq.houseprice;

		} else if (sq.groupNum == 2) {
			$("#deed-special").show();
			document.getElementById("deed-special-name").textContent = sq.name;
			document.getElementById("deed-special-text").innerHTML = foodArea();
			document.getElementById("deed-special-mortgage").textContent = (sq.price / 2);

		} else if (sq.groupNum == 1) {
			$("#deed-special").show();
			document.getElementById("deed-special-name").textContent = sq.name;
			document.getElementById("deed-special-text").innerHTML = campus();
			document.getElementById("deed-special-mortgage").textContent = (sq.price / 2);
		}
	}
}

function hidedeed() {
	$("#deed").hide();
}

function buy() {
	var p = player[turn];
	var property = square[p.position];
	var cost = property.price;

	if (p.money >= cost) {
		p.pay(cost, 0);

		property.owner = turn;
		updateMoney();
		addAlert(p.name + " bought " + property.name + " for " + property.pricetext + ".");

		updateOwned();

		$("#landed").hide();

	} else {
		popup("<p>" + p.name + ", you need " + (property.price - p.money) + " to buy " + property.name + ".</p>");
	}
}

function mortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];

	if (sq.house > 0 || sq.hotel > 0 || sq.mortgage) {
		return false;
	}

	var mortgagePrice = Math.round(sq.price * 0.5);
	var unmortgagePrice = Math.round(sq.price * 0.55);

	sq.mortgage = true;
	p.money += mortgagePrice;

	document.getElementById("mortgagebutton").value = "Unmortgage " + unmortgagePrice;
	document.getElementById("mortgagebutton").title = "Unmortgage " + sq.name + " for " + unmortgagePrice + ".";

	addAlert(p.name + " mortgaged " + sq.name + " for " + mortgagePrice + ".");
	updateOwned();
	updateMoney();

	return true;
}

function unmortgage(index) {
	var sq = square[index];
	var p = player[sq.owner];
	var unmortgagePrice = Math.round(sq.price * 0.55);
	var mortgagePrice = Math.round(sq.price * 0.5);

	if (unmortgagePrice > p.money || !sq.mortgage) {
		return false;
	}

	p.pay(unmortgagePrice, 0);
	sq.mortgage = false;
	document.getElementById("mortgagebutton").value = "Mortgage " + mortgagePrice;
	document.getElementById("mortgagebutton").title = "Mortgage " + sq.name + " for $" + mortgagePrice + ".";

	addAlert(p.name + " unmortgaged " + sq.name + " for $" + unmortgagePrice + ".");
	updateOwned();
	return true;
}


function land(increasedRent) {
	increasedRent = !!increasedRent;

	var p = player[turn];
	var s = square[p.position];

	var dice1 = game.getDice(1);
	var dice2 = game.getDice(2);

	$("#landed").show();
	document.getElementById("landed").innerHTML = "You landed on " + s.name + ".";
	s.landcount++;
	addAlert(p.name + " landed on " + s.name + ".");


	if (s.price !== 0 && s.owner === 0) {

		if (!p.human) {

			if (p.AI.buyProperty(p.position)) {
				buy();
			}
		} else {
			document.getElementById("landed").innerHTML = "<div>You landed on <a href='javascript:void(0);' onmouseover='showdeed(" + p.position + ");' onmouseout='hidedeed();' class='statscellcolor'>" + s.name + "</a>.<input type='button' onclick='buy();' value='Buy (" + s.price + ")' title='Buy " + s.name + " for " + s.pricetext + ".'/></div>";
		}


		game.addPropertyToAuctionQueue(p.position);
	}


	if (s.owner !== 0 && s.owner != turn && !s.mortgage) {
		var groupowned = true;
		var rent;


		if (p.position == 5 || p.position == 15 || p.position == 25 || p.position == 35) {
			if (increasedRent) {
				rent = 25;
			} else {
				rent = 12.5;
			}

			if (s.owner == square[5].owner) {
				rent *= 2;
			}
			if (s.owner == square[15].owner) {
				rent *= 2;
			}
			if (s.owner == square[25].owner) {
				rent *= 2;
			}
			if (s.owner == square[35].owner) {
				rent *= 2;
			}

		} else if (p.position === 12) {
			if (increasedRent || square[28].owner == s.owner) {
				rent = (dice1 + dice2) * 10;
			} else {
				rent = (dice1 + dice2) * 4;
			}

		} else if (p.position === 28) {
			if (increasedRent || square[12].owner == s.owner) {
				rent = (dice1 + dice2) * 10;
			} else {
				rent = (dice1 + dice2) * 4;
			}

		} else {

			for (var i = 0; i < 40; i++) {
				sq = square[i];
				if (sq.groupNum == s.groupNum && sq.owner != s.owner) {
					groupowned = false;
				}
			}

			if (!groupowned) {
				rent = s.baserent;
			} else {
				if (s.house === 0) {
					rent = s.baserent * 2;
				} else {
					rent = s["rent" + s.house];
				}
			}
		}

		addAlert(p.name + " paid " + rent + " rent to " + player[s.owner].name + ".");
		p.pay(rent, s.owner);
		player[s.owner].money += rent;

		document.getElementById("landed").innerHTML = "You landed on " + s.name + ". " + player[s.owner].name + " collected " + rent + " rent.";
	} else if (s.owner > 0 && s.owner != turn && s.mortgage) {
		document.getElementById("landed").innerHTML = "You landed on " + s.name + ". Property is mortgaged; didn't collect any rent.";
	}


	if (p.position === 4) {
		studentfees();
	}


	if (p.position === 30) {
		updateMoney();
		updatePosition();

		if (p.human) {
			popup("<div>Go to jail.</div>", gotojail);
		} else {
			gotojail();
		}

		return;
	}


	if (p.position === 38) {
		studentlevy();
	}

	updateMoney();
	updatePosition();
	updateOwned();

	if (!p.human) {
		popup(p.AI.alertList, chanceCommunityChest);
		p.AI.alertList = "";
	} else {
		chanceCommunityChest();
	}
}

function roll() {
	var p = player[turn];

	$("#option").hide();
	$("#buy").show();
	$("#manage").hide();

	if (p.human) {
		document.getElementById("nextbutton").focus();
	}
	document.getElementById("nextbutton").value = "End turn";
	document.getElementById("nextbutton").title = "End turn and advance to the next player.";

	game.rollDice();
	var dice1 = game.getDice(1);
	var dice2 = game.getDice(2);

	doublecount++;

	if (dice1 == dice2) {
		addAlert(p.name + " rolled " + (dice1 + dice2) + " - doubles.");
	} else {
		addAlert(p.name + " rolled " + (dice1 + dice2) + ".");
	}

	if (dice1 == dice2 && !p.jail) {
		updateDice(dice1, dice2);

		if (doublecount < 3) {
			document.getElementById("nextbutton").value = "Roll again";
			document.getElementById("nextbutton").title = "You threw a set of doubles. Roll again.";


		} else if (doublecount === 3) {
			p.jail = true;
			doublecount = 0;
			addAlert(p.name + " rolled doubles three times in a row.");
			updateMoney();


			if (p.human) {
				popup("You rolled doubles three times in a row. Go to jail.", gotojail);
			} else {
				gotojail();
			}

			return;
		}
	} else {
		document.getElementById("nextbutton").value = "End turn";
		document.getElementById("nextbutton").title = "End turn";
		doublecount = 0;
	}

	updatePosition();
	updateMoney();
	updateOwned();

	if (p.jail === true) {
		p.jailroll++;

		updateDice(dice1, dice2);
		if (dice1 == dice2) {
			document.getElementById("jail").style.border = "1px solid black";
			document.getElementById("cell11").style.border = "2px solid " + p.color;
			$("#landed").hide();

			p.jail = false;
			p.jailroll = 0;
			p.position = 10 + dice1 + dice2;
			doublecount = 0;

			addAlert(p.name + " rolled doubles, they leave jail.");

			land();
		} else {
			if (p.jailroll === 3) {

				if (p.human) {
					popup("<p>You have to pay the 50 fine.</p>", function() {
						payfifty();
						player[turn].position=10 + dice1 + dice2;
						land();
					});
				} else {
					payfifty();
					p.position = 10 + dice1 + dice2;
					land();
				}
			} else {
				$("#landed").show();
				document.getElementById("landed").innerHTML = "You are in jail.";

				if (!p.human) {
					popup(p.AI.alertList, game.next);
					p.AI.alertList = "";
				}
			}
		}


	} else {
		updateDice(dice1, dice2);

		p.position += dice1 + dice2;

		if (p.position >= 40) {
			p.position -= 40;
			p.money += 200;
			addAlert(p.name + "  got 200 for passing GO.");
		}

		land();
	}
}

function play() {
	if (game.auction()) {
		return;
	}

	turn++;
	if (turn > pcount) {
		turn -= pcount;
	}

	var p = player[turn];
	game.resetDice();

	document.getElementById("pname").innerHTML = p.name;

	addAlert("It is " + p.name + "'s turn.");

	p.pay(0, p.creditor);

	$("#landed, #option, #manage").hide();
	$("#board, #control, #moneybar, #viewstats, #buy").show();

	doublecount = 0;
	if (p.human) {
		document.getElementById("nextbutton").focus();
	}
	document.getElementById("nextbutton").value = "Roll Dice";
	document.getElementById("nextbutton").title = "Roll the dice";

	$("#die0").hide();
	$("#die1").hide();

	if (p.jail) {
		$("#landed").show();
		document.getElementById("landed").innerHTML = "You are in jail.<input type='button' title='Pay 50 fine to leave jail.' value='Pay $50 fine' onclick='payfifty();' />";

		if (p.communityChestJailCard || p.chanceJailCard) {
			document.getElementById("landed").innerHTML += "<input type='button' id='gojfbutton' title='Use &quot;Get Out of Jail Free&quot; card.' onclick='useJailCard();' value='Use Card' />";
		}

		document.getElementById("nextbutton").title = "Roll the dice. If you throw doubles, you will get out of jail.";

		if (p.jailroll === 0)
			addAlert("This is " + p.name + "'s first turn in jail.");
		else if (p.jailroll === 1)
			addAlert("This is " + p.name + "'s second turn in jail.");
		else if (p.jailroll === 2) {
			document.getElementById("landed").innerHTML += "<div>NOTE: If you do not throw doubles after this roll, you <i>have to</i> pay the 50 fine.</div>";
			addAlert("This is " + p.name + "'s third turn in jail.");
		}

		if (!p.human && p.AI.postBail()) {
			if (p.communityChestJailCard || p.chanceJailCard) {
				useJailCard();
			} else {
				payfifty();
			}
		}
	}

	updateMoney();
	updatePosition();
	updateOwned();

	$(".money-bar-arrow").hide();
	$("#p" + turn + "arrow").show();

	if (!p.human) {
		if (!p.AI.beforeTurn()) {
			game.next();
		}
	}
}

function setup() {
	pcount = parseInt(document.getElementById("playernumber").value, 10);

	var playerArray = new Array(pcount);
	var p;

	playerArray.randomize();

	for (var i = 1; i <= pcount; i++) {
		p = player[playerArray[i - 1]];


		p.color = document.getElementById("player" + i + "color").value.toLowerCase();

		if (document.getElementById("player" + i + "ai").value === "0") {
			p.name = document.getElementById("player" + i + "name").value;
			p.human = true;
		} else if (document.getElementById("player" + i + "ai").value === "1") {
			p.human = false;
			p.AI = new AI(p);
		}
	}

	$("#board, #moneybar").show();
	$("#setup").hide();

	if (pcount === 2) {
		document.getElementById("stats").style.width = "454px";
	} else if (pcount === 3) {
		document.getElementById("stats").style.width = "686px";
	}

	document.getElementById("stats").style.top = "0px";
	document.getElementById("stats").style.left = "0px";

	play();
}


function getCheckedProperty() {
	for (var i = 0; i < 42; i++) {
		if (document.getElementById("propertycheckbox" + i) && document.getElementById("propertycheckbox" + i).checked) {
			return i;
		}
	}
	return -1;
}


function playernumber_onchange() {
	pcount = parseInt(document.getElementById("playernumber").value, 10);

	$(".player-input").hide();

	for (var i = 1; i <= pcount; i++) {
		$("#player" + i + "input").show();
	}
}

function menuitem_onmouseover(element) {
	element.className = "menuitem menuitem_hover";
	return;
}

function menuitem_onmouseout(element) {
	element.className = "menuitem";
	return;
}

window.onload = function() {
	game = new Game();

	for (var i = 0; i <= 8; i++) {
		player[i] = new Player("", "");
		player[i].index = i;
	}

	var groupPropertyArray = [];
	var groupNum;

	for (var i = 0; i < 40; i++) {
		groupNum = square[i].groupNum;

		if (groupNum > 0) {
			if (!groupPropertyArray[groupNum]) {
				groupPropertyArray[groupNum] = [];
			}

			groupPropertyArray[groupNum].push(i);
		}
	}

	for (var i = 0; i < 40; i++) {
		groupNum = square[i].groupNum;

		if (groupNum > 0) {
			square[i].group = groupPropertyArray[groupNum];
		}

		square[i].index = i;
	}

	AI.count = 0;

	player[1].human = true;
	player[0].name = "the bank";

	communityChestCards.index = 0;
	chanceCards.index = 0;

	communityChestCards.deck = [];
	chanceCards.deck = [];

	for (var i = 0; i < 16; i++) {
		chanceCards.deck[i] = i;
		communityChestCards.deck[i] = i;
	}

	chanceCards.deck.sort(function() {return Math.random() - 0.5;});
	communityChestCards.deck.sort(function() {return Math.random() - 0.5;});

	$("#playernumber").on("change", playernumber_onchange);
	playernumber_onchange();

	$("#nextbutton").click(game.next);
	$("#setup, #noF5").show();

	var enlargeWrap = document.body.appendChild(document.createElement("div"));

	enlargeWrap.id = "enlarge-wrap";

	var HTML = "";
	for (var i = 0; i < 40; i++) {
		HTML += "<div id='enlarge" + i + "' class='enlarge'>";
		HTML += "<div id='enlarge" + i + "color' class='enlarge-color'></div><br /><div id='enlarge" + i + "name' class='enlarge-name'></div>";
		HTML += "<br /><div id='enlarge" + i + "price' class='enlarge-price'></div>";
		HTML += "<br /><div id='enlarge" + i + "token' class='enlarge-token'></div></div>";
	}

	enlargeWrap.innerHTML = HTML;

	var currentCell;
	var currentCellAnchor;
	var currentCellPositionHolder;
	var currentCellName;
	var currentCellOwner;

	for (var i = 0; i < 40; i++) {
		s = square[i];

		currentCell = document.getElementById("cell" + i);

		currentCellAnchor = currentCell.appendChild(document.createElement("div"));
		currentCellAnchor.id = "cell" + i + "anchor";
		currentCellAnchor.className = "cell-anchor";

		currentCellPositionHolder = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellPositionHolder.id = "cell" + i + "positionholder";
		currentCellPositionHolder.className = "cell-position-holder";
		currentCellPositionHolder.enlargeId = "enlarge" + i;

		currentCellName = currentCellAnchor.appendChild(document.createElement("div"));
		currentCellName.id = "cell" + i + "name";
		currentCellName.className = "cell-name";
		currentCellName.textContent = s.name;

		if (square[i].groupNum) {
			currentCellOwner = currentCellAnchor.appendChild(document.createElement("div"));
			currentCellOwner.id = "cell" + i + "owner";
			currentCellOwner.className = "cell-owner";
		}

		document.getElementById("enlarge" + i + "color").style.backgroundColor = s.color;
		document.getElementById("enlarge" + i + "name").textContent = s.name;
		document.getElementById("enlarge" + i + "price").textContent = s.pricetext;
	}



	$("<div>", {id: "jailpositionholder" }).appendTo("#jail");
	$("<span>").text("Jail").appendTo("#jail");

	document.getElementById("jail").enlargeId = "enlarge40";

	document.getElementById("enlarge-wrap").innerHTML += "<div id='enlarge40' class='enlarge'><div id='enlarge40color' class='enlarge-color'></div><br /><div id='enlarge40name' class='enlarge-name'>Jail</div><br /><div id='enlarge40price' class='enlarge-price'></div><br /><div id='enlarge40token' class='enlarge-token'></div></div>";

	document.getElementById("enlarge40name").innerHTML = "Jail";


	var drag, dragX, dragY, dragObj, dragTop, dragLeft;

	$(".cell-position-holder, #jail").on("mouseover", function(){
		$("#" + this.enlargeId).show();

	}).on("mouseout", function() {
		$("#" + this.enlargeId).hide();

	}).on("mousemove", function(e) {
		var element = document.getElementById(this.enlargeId);

		if (e.clientY + 20 > window.innerHeight - 204) {
			element.style.top = (window.innerHeight - 204) + "px";
		} else {
			element.style.top = (e.clientY + 20) + "px";
		}

		element.style.left = (e.clientX + 10) + "px";
	});


	$("body").on("mousemove", function(e) {
		var object;

		if (e.target) {
			object = e.target;
		} else if (window.event && window.event.srcElement) {
			object = window.event.srcElement;
		}


		if (object.classList.contains("propertycellcolor") || object.classList.contains("statscellcolor")) {
			if (e.clientY + 20 > window.innerHeight - 279) {
				document.getElementById("deed").style.top = (window.innerHeight - 279) + "px";
			} else {
				document.getElementById("deed").style.top = (e.clientY + 20) + "px";
			}
			document.getElementById("deed").style.left = (e.clientX + 10) + "px";


		} else if (drag) {
			if (e) {
				dragObj.style.left = (dragLeft + e.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + e.clientY - dragY) + "px";

			} else if (window.event) {
				dragObj.style.left = (dragLeft + window.event.clientX - dragX) + "px";
				dragObj.style.top = (dragTop + window.event.clientY - dragY) + "px";
			}
		}
	});


	$("body").on("mouseup", function() {

		drag = false;
	});
	document.getElementById("statsdrag").onmousedown = function(e) {
		dragObj = document.getElementById("stats");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	document.getElementById("popupdrag").onmousedown = function(e) {
		dragObj = document.getElementById("popup");
		dragObj.style.position = "relative";

		dragTop = parseInt(dragObj.style.top, 10) || 0;
		dragLeft = parseInt(dragObj.style.left, 10) || 0;

		if (window.event) {
			dragX = window.event.clientX;
			dragY = window.event.clientY;
		} else if (e) {
			dragX = e.clientX;
			dragY = e.clientY;
		}

		drag = true;
	};

	$("#mortgagebutton").click(function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];

		if (s.mortgage) {
			if (player[s.owner].money < Math.round(s.price * 0.55)) {
				popup("<p>You need $" + (Math.round(s.price * 0.55) - player[s.owner].money) + " more to unmortgage " + s.name + ".</p>");

			} else {
				popup("<p>" + player[s.owner].name + ", are you sure you want to unmortgage " + s.name + " for " + Math.round(s.price * 0.55) + "?</p>", function() {
					unmortgage(checkedProperty);
				}, "Yes/No");
			}
		} else {
			popup("<p>" + player[s.owner].name + ", are you sure you want to mortgage " + s.name + " for " + Math.round(s.price * 0.5) + "?</p>", function() {
				mortgage(checkedProperty);
			}, "Yes/No");
		}

	});

	$("#buyhousebutton").on("click", function() {
		var checkedProperty = getCheckedProperty();
		var s = square[checkedProperty];
		var p = player[s.owner];
		var sumHouse = 0;
		var sumHotel = 0;

		if (p.money < s.houseprice) {
			if (s.house === 4) {
				popup("<p>You need " + (s.houseprice - player[s.owner].money) + " more cash to buy a hotel for " + s.name + ".</p>");
				return;
			} else {
				popup("<p>You need " + (s.houseprice - player[s.owner].money) + " more cash to buy a house for " + s.name + ".</p>");
				return;
			}
		}

		for (var i = 0; i < 40; i++) {
			if (square[i].hotel === 1) {
				sumHotel++;
			} else {
				sumHouse += square[i].house;
			}
		}

		if (s.house < 4 && sumHouse >= 32) {
			popup("<p>All 32 houses are owned. You have to wait until one is available</p>");
			return;
		} else if (s.house === 4 && sumHotel >= 12) {
			popup("<p>All 12 hotels are owned. You have to wait until one is available.</p>");
			return;
		}

		buyHouse(checkedProperty);

	});

	$("#sellhousebutton").click(function() { sellHouse(getCheckedProperty()); });

	$("#viewstats").on("click", showStats);
	$("#statsclose, #statsbackground").on("click", function() {
		$("#statswrap").hide();
		$("#statsbackground").fadeOut(400);
	});

	$("#buy-menu-item").click(function() {
		$("#buy").show();
		$("#manage").hide();

		$("#alert").scrollTop($("#alert").prop("scrollHeight"));
	});


	$("#manage-menu-item").click(function() {
		$("#manage").show();
		$("#buy").hide();
	});


	$("#trade-menu-item").click(game.trade);


};
