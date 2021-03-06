
//=====================================================================
// Class declarations
//=====================================================================
class Level
{
	constructor(Name, PointStartValue, PointValue, PointMultiplier)
	{
		var PointsEndValue = PointStartValue + PointValue * 4 * PointMultiplier;
		var PointsHalfValue = Math.floor(PointsEndValue / 2);
		var PointsIncrement = Math.round(Math.floor(PointsEndValue / 2) / 4);
		this.Name = Name;
		this.Points = [0, 0, 0, 0, 0];
		for (var i = 0; i < 5; i += 1)
		{
			this.Points[i] = PointsHalfValue + PointsIncrement * i + 1;
		}
	}
}

class Upgrade
{
	// Create new upgrade
	constructor(Id, Name, Description, Cost, ParentId, Class)
	{
		this.Id = Id;
		this.Name = Name;
		this.Description = Description;
		this.Cost = Cost;
		this.ParentId = ParentId;
		this.Class = Class;
		this.Purchased = false;
	}
	// [Internal use]
	// Get index of an upgrade in the array
	static GetIndexOf(Id)
	{
		for (var i = 0; i < GlobalUpgrades.length; i++)
		{
			if (GlobalUpgrades[i].Id == Id)
			{
				return i;
			}
		}
		return -1;
	}
	// Is the upgrade visible on the list (i.e. can be purchased)
	static IsVisible(Id)
	{
		var Index = Upgrade.GetIndexOf(Id);
		// No upgrade found or already purchased - hide
		if (Index == -1 || GlobalUpgrades[Index].Purchased == true)
			return false;
		// Special conditions
		if (Id == "cheat_extraLife" && TotalExamsFailed == 0) { return false; }
		// No parent (and not purchased yet) - show
		if (GlobalUpgrades[Index].ParentId == null)
			return true;
		// Else look for parent
		for (var i = 0; i < GlobalUpgrades.length; i++)
		{
			if (GlobalUpgrades[i].Id == GlobalUpgrades[Index].ParentId)
			{
				if (Upgrade.IsPurchased(GlobalUpgrades[i].Id) == true) {
					return true;
				}
				else {
					return false;
				}
			}
		}
		return false;
	}
	// Is the upgrade already purchased
	static IsPurchased(Id)
	{
		var Index = Upgrade.GetIndexOf(Id);
		if (Index == -1)
			return false;
		return GlobalUpgrades[Index].Purchased;
	}
	// Is the upgrade a part of a class
	static IsClassified(Id, Class)
	{
		var Index = Upgrade.GetIndexOf(Id);
		if (Index == -1)
			return false;
		return (GlobalUpgrades[Index].Class.indexOf(Class) != -1)
	}
	// Buy the upgrade
	static Buy(Id)
	{
		var Index = Upgrade.GetIndexOf(Id);
		var Cost = GlobalUpgrades[Index].Cost;
		if (CurrencyUnits >= Cost)
		{
			Stats_TotalUpgrades += 1;
			// Cheat check
			if (Upgrade.IsClassified(Id, "cheat"))
			{
				if (Math.random() <= 0.10) {
					// You've been caught
					TotalCheatsFound = 1;
					ShowHome();
					return;
				}
				Stats_TotalCheats += 1;
			}
			// Check check passed, use the money
			CurrencyUnits -= Cost;
			GlobalUpgrades[Index].Purchased = true;
			// Special upgrades
			if (Id == "cheat_extraLife") { TotalExamsFailed -= 1; }
			if (Id == "cheat_twin") { NextExam_OnClick(); ExamPoints = GlobalLevels[CurrentExamOrdinal].Points[Math.round(Math.random() * 5)]; EndExam_OnClick(); }
			// Resettable
			if (Upgrade.IsClassified(Id, "repeatable")) { GlobalUpgrades[Index].Purchased = false; }
			// Update
			UpdateHome();
		}
	}
}

//=====================================================================
// Global scope variables
//=====================================================================
var CurrentExamOrdinal = 0;
var TotalExamsPassed = 0;
var TotalExamsFailed = 0;
var TotalCheatsFound = 0;
var GlobalLevels = [];
var GlobalUpgrades = [];
var ExamPoints = 0;
var CurrencyUnits = 0;
var LastExamPassed = true;
var DebugMode = false;

var Stats_Timestamp = 0;
var Stats_TotalClicks = 0;
var Stats_TotalUpgrades = 0;
var Stats_TotalCheats = 0;
var Stats_TotalMoney = 0;

//=====================================================================
// Initialization
//=====================================================================
function Initialization()
{
	Stats_Timestamp = new Date();
	Stats_TotalMoney += CurrencyUnits;
	// Push levels
	// Note: The levels will appear in that order. Point counts are independant from the level names and setup below.
	// You can change the names here if you wish, but be careful with formatting.
	var LevelNames =
	[
		"Programming fundamentals exam",
		"Mathematics exam",
		"Electronics and digits exam",
		"Biology exam",
		"Business fundamentals exam",
		"World History exam",
		"Physics exam",
		"Computer networks exam",
		"ICT professional skills exam",
		"Insta-finishnish exam",
		"Law exam",
		"Hardware and Software exam",
		"Engineering exam",
		"Music Theory exam",
		"Psychology exam",
		"Microeconomics exam",
		"Geography exam",
		"Chemistry exam",
		"European History exam",
		"Art exam",
		"Environmental Science exam",
		"Studio Art Drawing exam",
		"Information Systems exam",
		"Principles of Marketing exam",
		"Principles of Management exam",
		"Human Growth exam",
		"English literature exam",
		"Finnish literature exam",
		"Architecture exam",
		"Computer Science exam",
		"Windows Administration Fundamentals exam",
		"Linux+ exam",
		"Impossible exam",
	];
	// Points setup
	var StartValue = 10;
	var PointValue = 2;
	var PointMultiplier = 1;
	var i = 0;
	while(LevelNames.length > 0)
	{
		var Name = LevelNames.shift();
		GlobalLevels.push(new Level(Name, StartValue, PointValue, PointMultiplier));
		StartValue += 5;
		PointValue += 1;
		if (i % 10 == 0)
		{
			StartValue -= 5;
			PointMultiplier += 1;
		}
		i += 1;
	}

	// Push upgrades
	// Note: If you wish to change the priority in the upgrade list, change the order here (move the whole string up or down).
	// GlobalUpgrades.push(new Upgrade(id, DisplayedName, Description, Cost, ParentId, Classification))
	GlobalUpgrades.push(new Upgrade("click01", "Enthusiasm", "Each click now gives you 2 points.", 3, null, ""));
	GlobalUpgrades.push(new Upgrade("click02", "Courage", "Each click now gives you 3 points.", 3, "click01", ""));
	GlobalUpgrades.push(new Upgrade("click03", "Persistence", "Each click now gives you 4 points.", 3, "click02", ""));
	GlobalUpgrades.push(new Upgrade("click04", "Dedication", "Each click now gives you 5 points.", 3, "click03", ""));
	GlobalUpgrades.push(new Upgrade("click05", "Determination", "Each click now gives you 10 points.", 7, "click04", ""));
	GlobalUpgrades.push(new Upgrade("speed01", "Time Management, Introductory course", "Your clicks are now 50% faster.", 3, null, ""));
	GlobalUpgrades.push(new Upgrade("speed02", "Time Management, Advanced course", "Your clicks are now 2 times faster.", 3, "speed01", ""));
	GlobalUpgrades.push(new Upgrade("speed03", "Time Management, Professional course", "Your clicks are now 3 times faster.", 3, "speed02", ""));
	GlobalUpgrades.push(new Upgrade("speed04", "Time Management, Scientific course", "Your clicks are now 4 times faster.", 3, "speed03", ""));
	GlobalUpgrades.push(new Upgrade("time01", "Alarm Clock", "You get slightly more time for an exam.", 1, null, ""));
	GlobalUpgrades.push(new Upgrade("time02", "Redundant Alarm Clocks", "You get even more time for an exam.", 3, "time01", ""));
	GlobalUpgrades.push(new Upgrade("time03", "Overclocked Alarm Clock", "You get all the time in the world for an exam.", 5, "time02", ""));
	GlobalUpgrades.push(new Upgrade("speed_jacobs", "Time Management, Jacobs course", "Fires as fast as you can pull down the trigger.", 7, "speed04", ""));
	GlobalUpgrades.push(new Upgrade("crit", "Sudden Inspiration", "You have a 5% chance to get inspired and double your points for a click.", 3, "click01", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage01", "Massive Inspiration, Level 1", "Inspiration now gives you 2.5x points.", 3, "crit", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage02", "Massive Inspiration, Level 2", "Inspiration now gives you 3.0x points.", 3, "crit_damage01", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage03", "Massive Inspiration, Level 3", "Inspiration now gives you 3.5x points.", 3, "crit_damage02", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage04", "Massive Inspiration, Level 4", "Inspiration now gives you 4.0x points.", 3, "crit_damage03", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage05", "Massive Inspiration, Level 5", "Inspiration now gives you 4.5x points.", 3, "crit_damage04", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage06", "Massive Inspiration, Level 6", "Inspiration now gives you 5.0x points.", 3, "crit_damage05", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage07", "Massive Inspiration, Level 7", "Inspiration now gives you 5.5x points.", 3, "crit_damage06", ""));
	GlobalUpgrades.push(new Upgrade("crit_damage08", "Massive Inspiration, Level 8", "Inspiration now gives you 6.0x points.", 3, "crit_damage07", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance01", "Reliable Inspiration, Level 1", "Inspiration now has 10% chance to occur.", 3, "crit", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance02", "Reliable Inspiration, Level 2", "Inspiration now has 15% chance to occur.", 3, "crit_chance01", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance03", "Reliable Inspiration, Level 3", "Inspiration now has 20% chance to occur.", 3, "crit_chance02", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance04", "Reliable Inspiration, Level 4", "Inspiration now has 25% chance to occur.", 3, "crit_chance03", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance05", "Reliable Inspiration, Level 5", "Inspiration now has 30% chance to occur.", 3, "crit_chance04", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance06", "Reliable Inspiration, Level 6", "Inspiration now has 35% chance to occur.", 3, "crit_chance05", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance07", "Reliable Inspiration, Level 7", "Inspiration now has 40% chance to occur.", 3, "crit_chance06", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance08", "Reliable Inspiration, Level 8", "Inspiration now has 45% chance to occur.", 3, "crit_chance07", ""));
	GlobalUpgrades.push(new Upgrade("crit_chance09", "Reliable Inspiration, Level 9", "Inspiration now has 50% chance to occur.", 3, "crit_chance08", ""));
	GlobalUpgrades.push(new Upgrade("cheat_base", "Cheating", "Unlock the cheats. Be careful with those though.", 3, null, ""));
	GlobalUpgrades.push(new Upgrade("cheat_extraLife", "Extra Life", "Let's pretend that one failed exam didn't happen, ok?", 1, "cheat_base", "cheat&repeatable"));
	GlobalUpgrades.push(new Upgrade("cheat_twin", "Find a Twin", "You ask your twin to come to an exam instead of you.", 2, "cheat_base", "cheat&repeatable"));
	GlobalUpgrades.push(new Upgrade("cheat_fakePaper", "Fake Paper", "You start the next exam with some amount of points.", 1, "cheat_base", "cheat&consumable"));
	GlobalUpgrades.push(new Upgrade("cheat_bribe", "Bribe a Teacher", "Your time for the next exam is doubled.", 1, "cheat_base", "cheat&consumable"));
	//GlobalUpgrades.push(new Upgrade("crit_double01", "Inspiration Overflow", "Inspiration now can happen one extra time.", 5, "crit_damage08"));
	//GlobalUpgrades.push(new Upgrade("crit_double02", "Inspiration Overflow", "Inspiration now can happen one extra time.", 5, "crit_chance09"));
	// Debug stuff
	if (DebugMode == true) {
		CurrencyUnits += 100;
		GlobalUpgrades[Upgrade.GetIndexOf("speed_jacobs")].Purchased = true;
	}
	// Show starting UI
	ShowTitle();
}

//=====================================================================
// Event handlers
//=====================================================================
function StartGame_OnClick()
{
	Exam_Timer();
	ShowExam();
}

function WorkHard_OnClick()
{
	Stats_TotalClicks += 1;
	if (ExamPoints < GlobalLevels[CurrentExamOrdinal].Points[4])
	{
		// Start timer
		if (Upgrade.IsPurchased("speed_jacobs") == false)
		{
			WorkHard_Timer();
			document.getElementById("ExamWorkHard").disabled = true;
		}
		// Insta-finish timer
		else
		{
			WorkHard_TimerEnd();
		}
	}
}

function WorkHard_TimerEnd()
{
	// Add the points				
	ExamPoints += GetExamPointsPerClick();
	// Update points
	var Goal = GetCurrentExamPointsGoal();
	if (ExamPoints > Goal) { ExamPoints = Goal; }
	UpdateExamPoints();
}

function EndExam_OnClick()
{
	// Update the stats
	var Grade = GetCurrentExamGrade();
	if (Grade == 0 && DebugMode == false) {
		LastExamPassed = false;
		TotalExamsFailed += 1;
	}
	else {
		LastExamPassed = true;
		TotalExamsPassed += 1;
	}
	CurrencyUnits += Grade;
	Stats_TotalMoney += Grade;
	// Clear consumables
	for (var i = 0; i < GlobalUpgrades.length; i++) {
		if (Upgrade.IsClassified(GlobalUpgrades[i].Id, "consumable")) {
			GlobalUpgrades[i].Purchased = false;
		}
	}

	window.clearInterval(ExamTimerId);
	ShowHome();
}

function NextExam_OnClick()
{
	if (CurrentExamOrdinal < GlobalLevels.length - 1)
	{
		Exam_Timer();
		ExamPoints = 0;
		if (LastExamPassed == true) {
			CurrentExamOrdinal += 1;
		}
		// Use consumables
		if (Upgrade.IsPurchased("cheat_fakePaper")) { ExamPoints = Math.round(Math.random() * GlobalLevels[CurrentExamOrdinal].Points[2]); }
		ShowExam();
	}
}

function BuyUpgrade_OnClick(ButtonId)
{
	var UpgradeId = ButtonId.substring(7);
	Upgrade.Buy(UpgradeId);
}

//=====================================================================
// Supplementary functions
//=====================================================================
function GetExamPointsPerClick()
{
	var PointsToAdd = 1;
	// Vanilla points
	if (Upgrade.IsPurchased("click01")) { PointsToAdd = 2; } 
	if (Upgrade.IsPurchased("click02")) { PointsToAdd = 3; } 
	if (Upgrade.IsPurchased("click03")) { PointsToAdd = 4; } 
	if (Upgrade.IsPurchased("click04")) { PointsToAdd = 5; } 
	if (Upgrade.IsPurchased("click05")) { PointsToAdd = 10; } 
	// Inspiration
	if (Upgrade.IsPurchased("crit"))
	{
		// Calculate the chance
		var CritChance = 0.05;
		if (Upgrade.IsPurchased("crit_chance01")) { CritChance = 0.10; }
		if (Upgrade.IsPurchased("crit_chance02")) { CritChance = 0.15; }
		if (Upgrade.IsPurchased("crit_chance03")) { CritChance = 0.20; }
		if (Upgrade.IsPurchased("crit_chance04")) { CritChance = 0.25; }
		if (Upgrade.IsPurchased("crit_chance05")) { CritChance = 0.30; }
		if (Upgrade.IsPurchased("crit_chance06")) { CritChance = 0.35; }
		if (Upgrade.IsPurchased("crit_chance07")) { CritChance = 0.40; }
		if (Upgrade.IsPurchased("crit_chance08")) { CritChance = 0.45; }
		if (Upgrade.IsPurchased("crit_chance09")) { CritChance = 0.50; }
		var CritFactor = 2;
		if (Upgrade.IsPurchased("crit_damage01")) { CritFactor = 2.5; }
		if (Upgrade.IsPurchased("crit_damage02")) { CritFactor = 3.0; }
		if (Upgrade.IsPurchased("crit_damage03")) { CritFactor = 3.5; }
		if (Upgrade.IsPurchased("crit_damage04")) { CritFactor = 4.0; }
		if (Upgrade.IsPurchased("crit_damage05")) { CritFactor = 4.5; }
		if (Upgrade.IsPurchased("crit_damage06")) { CritFactor = 5.0; }
		if (Upgrade.IsPurchased("crit_damage07")) { CritFactor = 5.5; }
		if (Upgrade.IsPurchased("crit_damage08")) { CritFactor = 6.0; }
		// Apply critical(s)
		var CritRolls = 1;
		if (Upgrade.IsPurchased("crit_double01")) { CritRolls += 1; }
		if (Upgrade.IsPurchased("crit_double02")) { CritRolls += 1; }
		for (var i = 0; i < CritRolls; i++)
		{
			var Roll = Math.random();
			if (Roll < CritChance) { PointsToAdd *= CritFactor; }
			else { break; }
		}
	}
	return Math.floor(PointsToAdd);
}

function GetWorkHardTimeModifier()
{
	var SpeedModifier = 1.0;
	if (Upgrade.IsPurchased("speed01")) { SpeedModifier = 1.5; }
	if (Upgrade.IsPurchased("speed02")) { SpeedModifier = 2.0; }
	if (Upgrade.IsPurchased("speed03")) { SpeedModifier = 3.0; }
	if (Upgrade.IsPurchased("speed04")) { SpeedModifier = 4.0; }
	return SpeedModifier;
}

function GetCurrentExamGrade()
{
	var Grade = 5;
	for (var i = 0; i < 5; i++) {
		if (ExamPoints < GlobalLevels[CurrentExamOrdinal].Points[i]) {
			Grade = i;
			break;
		}
	}
	return Grade;
}

function GetCurrentExamPointsGoal()
{
	return GlobalLevels[CurrentExamOrdinal].Points[4];
	// The following code returns the next goal value depending on the current grade.
	/*var Goal = GlobalLevels[CurrentExamOrdinal].Points[4];
	for (var i = 0; i < 5; i++) {
		if (ExamPoints < GlobalLevels[CurrentExamOrdinal].Points[i]) {
			Goal = GlobalLevels[CurrentExamOrdinal].Points[i];
			break;
		}
	}
	return Goal;*/
}

function ShowHome()
{
	// Display home
	document.getElementById("Title").style.display = "none";
	document.getElementById("Exam").style.display = "none";
	document.getElementById("Home").style.display = "block";
	document.getElementById("HomeGameOver").style.display = "none";
	// Game over conditions
	var ShowStatistics = false;
	if (TotalExamsFailed == 3)
	{
		ShowStatistics = true;
		document.getElementById("HomeContinue").style.display = "none";
		document.getElementById("HomeGameOver").style.display = "block";
		document.getElementById("HomeGameOverForReals").style.display = "block";
		document.getElementById("HomeGameOverForCheats").style.display = "none";
	}
	else if (TotalCheatsFound == 1)
	{
		ShowStatistics = true;
		document.getElementById("HomeContinue").style.display = "none";
		document.getElementById("HomeGameOver").style.display = "block";
		document.getElementById("HomeGameOverForReals").style.display = "none";
		document.getElementById("HomeGameOverForCheats").style.display = "block";
	}
	// Summarize statistics
	if (ShowStatistics == true)
	{
		var Timestamp = new Date();
		var Stats_TimeTaken = (Timestamp - Stats_Timestamp) / 1000;
		document.getElementById("Stats_TimeTaken").innerHTML = Stats_TimeTaken + " seconds";
		document.getElementById("Stats_TotalClicks").innerHTML = Stats_TotalClicks;
		document.getElementById("Stats_TotalExams").innerHTML = TotalExamsPassed + TotalExamsFailed;
		document.getElementById("Stats_TotalUpgrades").innerHTML = Stats_TotalUpgrades;
		document.getElementById("Stats_TotalCheats").innerHTML = Stats_TotalCheats;
		document.getElementById("Stats_TotalMoney").innerHTML = Stats_TotalMoney;
	}
	// Update the UI
	UpdateHome();
}

function ShowExam()
{
	document.getElementById("Title").style.display = "none";
	document.getElementById("Home").style.display = "none";
	document.getElementById("Exam").style.display = "block";
	UpdateExamPoints();
	UpdateExamOrdinal();
}

function ShowTitle()
{
	document.getElementById("Title").style.display = "block";
	document.getElementById("Home").style.display = "none";
	document.getElementById("Exam").style.display = "none";
}

function WorkHard_Timer()
{
	var TimerId = window.setInterval(WorkHard_OnProgressUpdate, 20);
	var Timestamp = new Date();

	function WorkHard_OnProgressUpdate()
	{
		var Progress = document.getElementById("ExamWorkProgress");
		if (Progress.value >= Progress.max)
		{
			Progress.value = 0;
		}
		else
		{
			var NewTimestamp = new Date();
			Progress.value += (NewTimestamp - Timestamp) * GetWorkHardTimeModifier();
			Timestamp = NewTimestamp;
			if (Progress.value >= Progress.max)
			{
				window.clearInterval(TimerId);
				document.getElementById("ExamWorkHard").disabled = false;
				WorkHard_TimerEnd();
			}
		}
	}
}

var ExamTimerId;
function Exam_Timer()
{
	ExamTimerId = window.setInterval(Exam_OnTimerUpdate, 1000);
	var TimerData = 61;
	if (Upgrade.IsPurchased("time01")) { TimerData += 15; }
	if (Upgrade.IsPurchased("time02")) { TimerData += 30; }
	if (Upgrade.IsPurchased("time03")) { TimerData += 45; }
	if (Upgrade.IsPurchased("cheat_bribe")) { TimerData *= 2; TimerData -= 1; }
	Exam_OnTimerUpdate();

	function Exam_OnTimerUpdate()
	{
		TimerData -= 1;
		// Get label
		var Label = document.getElementById("ExamTimeProgress");
		// Calculate values
		var Minutes = Math.floor(TimerData / 60);
		var Seconds = TimerData - Minutes * 60;
		// Display values
		var LabelText = "";
		if (Minutes < 10)
		{
			LabelText += "0";
		}
		LabelText += Minutes + ":";
		if (Seconds < 10)
		{
			LabelText += "0";
		}
		LabelText += Seconds;
		Label.innerHTML = LabelText;

		if (TimerData == -1)
		{
			EndExam_OnClick();
		}
	}
}

//=====================================================================
// UI update functions
//=====================================================================
function UpdateExamPoints()
{
	// Calculate the goal and grade
	var Grade = GetCurrentExamGrade();
	var PointsGoal = GetCurrentExamPointsGoal();
	// Update the UI
	document.getElementById("ExamPointsCurrent").innerHTML = ExamPoints;
	document.getElementById("ExamPointsMax").innerHTML = PointsGoal;
	document.getElementById("ExamGradeValue").innerHTML = Grade;
	// Grade color code
	if (Grade == 0) {
		document.getElementById("ExamGradeValue").style.color = "red";
	}
	else if (Grade < 5) {
		document.getElementById("ExamGradeValue").style.color = "orange";
	}
	else if (Grade == 5) {
		document.getElementById("ExamGradeValue").style.color = "green";
	}
}

function UpdateExamOrdinal()
{
	document.getElementById("ExamName").innerHTML = GlobalLevels[CurrentExamOrdinal].Name;
	//document.getElementById("ExamNumber").innerHTML = "[№" + (CurrentExamOrdinal + 1) + "]";
	document.getElementById("ExamNumber").innerHTML = "";
}

function UpdateHome()
{
	var Grade = GetCurrentExamGrade();
	// Determine the outcome message
	var ExamStatus;
	if (Grade == 0 && DebugMode == false) { ExamStatus = "You have failed the exam!"; }
	else if (Grade == 0 && DebugMode == true) { ExamStatus = "You have failed the exam! But it's debug mode so it's all k."; }
	else { ExamStatus = "Congratulations! You have passed the exam with grade " + Grade; }
	// Update elements
	document.getElementById("HomeExamStatus").innerHTML = ExamStatus;
	document.getElementById("HomeCurrencyUnits").innerHTML = "- Your (up)grade money: " + CurrencyUnits;
	document.getElementById("HomeExamsPassed").innerHTML = "- Exams passed: " + TotalExamsPassed;
	document.getElementById("HomeExamsFailed").innerHTML = "- Exams failed: " + TotalExamsFailed + " / 3";
	// Update upgrade list
	UpdateUpgradeList();
}

function UpdateUpgradeList()
{
	var Div = "";
	document.getElementById("HomeUpgrades").innerHTML = "";
	for (var i = 0; i < GlobalUpgrades.length; i++)
	{
		if (Upgrade.IsVisible(GlobalUpgrades[i].Id))
		{
			// Div tag
			Div = "<div id=\"Upg_" + GlobalUpgrades[i].Id + "\" class=\"HomeUpgradesFloater\">";
			// Upgrade name
			Div += "<div><div>" + GlobalUpgrades[i].Name + "</div>";
			// Upgrade cost
			Div += "<div>Cost: " + GlobalUpgrades[i].Cost + "</div>";
			// Upgrade description
			Div += "<div class=\"HomeUpgradesText\">" + GlobalUpgrades[i].Description + "</div>";
			// Cheat warning
			if (Upgrade.IsClassified(GlobalUpgrades[i].Id, "cheat")) {
				Div += "<div class=\"HomeUpgradesCheatWarning\">You have 10% chance to be caught cheating!</div>";
			}
			Div += "</div>";
			// Button
			Div += "<button id=\"UpgBtn_" + GlobalUpgrades[i].Id + "\" class=\"HomeUpgradesButton\" onclick=\"BuyUpgrade_OnClick(this.id)\">Buy</button>";
			// Div closing tag
			Div += "</div>"
			document.getElementById("HomeUpgrades").innerHTML += Div;
		}
	}
}