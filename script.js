$(document).ready(function() {

	// Generate cards (once, when page loads)
	let programListHTML = '';
	// programDatabase comes from xsl
	programDatabase.forEach(function(program, index) {
		// Online or on campus
		let deliveryMethodIcon = '';
		let deliveryMethodClass = 'programCard__deliveryMethod'
		let deliveryMethodString = '';
		if (program['Delivery Method'].toLowerCase() == 'on campus') {
			deliveryMethodString = "On Campus";
			deliveryMethodClass += ' -onCampus';
			deliveryMethodIcon = `<i class="fa-regular fa-building"></i> `;
		}
		else if (program['Delivery Method'].toLowerCase() == 'online') {
			deliveryMethodString = "Online";
			deliveryMethodClass += ' -online';
			deliveryMethodIcon = `<i class="fa-regular fa-globe"></i> `;
		}
		// Check for link (There should always be a link, this is mainly for dev purposes)
		let link = '';
		if (program['Link'].length > 2) {
			link = program['Link'];
		}
		
		// Check for image (there should always be an image, this is mainly for dev purposes)
		let image = '';
		// If available, use image from database
		if (program['Image'].length > 2) {
			image = program['Image'];
		}
		
		let cardHTML =
			`
<div class="programCard">
<a href="${link}">
${image}
<div class="programCard__text">
<h4 class="script-ignore">${program['Program Name']}</h4>
<div class="programCard__degreeType">${program['Degree Type']}</div>
<br />
<div class="${deliveryMethodClass}">${deliveryMethodIcon}${deliveryMethodString}</div>
</div>
</a>
</div>
`;
		programListHTML += cardHTML;
	})
	// Add cards to HTML
	$('.programCardContainer').html(programListHTML);

	// Prepare the toggling of undergraduate and graduate filters
	$('.filterEducationLevel').change(updateEducationLevel)

	// Set program results to update when a filter changes
	$('.pageLayout__filters input').change(updateResults);
	// Set local storage to memorize filters when a filter changes
	$('.pageLayout__filters input').change(memorizeFilters);

	// Check for URL parameters
	const parameterString = window.location.search;
	// Get the parameter values
	const params = new URLSearchParams(parameterString);
	// If filters parameter is present
	if (params.get('filters')) {
		// Break down the value into the separate filter id's
		const listedFilters = params.get('filters').split(',');
		// Check the listed filter inputs
		for (let i = 0; i < listedFilters.length; i++) {
			const thisInput = '#filters__' + listedFilters[i];
			console.log('setting: ' + thisInput);
			$(thisInput).prop('checked', true);
			console.log('confirming status: ' + $(thisInput).prop('checked'));
			openTheAccordionOfThisInput(thisInput);
		}
	}
	else {
		// Remember past filter selections
		rememberFilters();
	}

	// Update the results
	updateResults();
	// Update the display of education level dependant elements
	updateEducationLevel();

})
// End of $(document).ready()


function resetFilters() {
	// Clear all filters in case browser history remembered inputs
	$('.pageLayout__filters input').prop('checked', false);

	updateResults();
	updateEducationLevel();
	memorizeFilters();

	// Close accordions
	$('.accordion').each(function(index, element) {
		if (element.id !== 'accordionDegreeType') {
			closeAccordion(element.id);
		}
	})

	// Scroll user to top of page
	window.scrollTo(0, 0);
}

// Function to memorize filter selection into localStorage
function memorizeFilters() {
	// Start new URL for browser history
	let newURL = location.pathname;
	let filters = [];

	// Iterate through each filter input element
	$('.pageLayout__filters input').each(function(index, element) {
		// Prepare the local storage content
		let thisKey = 'Program Page Filters: ' + element.id;
		let thisValue = $(element).is(':checked');
		// Set the local storage
		localStorage.setItem(thisKey, thisValue);

		// Add filter ID to the list for the new URL
		if (thisValue === true) {
			filters.push(element.id.replace('filters__', ''));
		}
	})

	// Add parameters to new URL
	if (filters.length > 0) {
		newURL += '?filters=' + filters.join(',');
	}

	// Update page history with the new URL
	try {
		history.replaceState(null, '', newURL);
	}
	catch(e) {
		// It will fail in Omni. That's fine.
	}

	// (This page history updating is necessary because without it, there was a conflict between URL parameters and localStorage memory (and/or browser session memory) when navigating to the page via the Back button. There may be a more elegant solution to this.)
}

// Function to remember filter selection from localStorage
function rememberFilters() {
	$('.pageLayout__filters input').each(function(index, element) {
		// Retrieve the value
		let thisKey = 'Program Page Filters: ' + element.id;
		let thisValue = (localStorage.getItem(thisKey) === 'true');
		// Set the element's value
		$(element).prop('checked', thisValue);

		// Check if accordion needs to be opened
		if (thisValue === true) {
			openTheAccordionOfThisInput(element);
		}
	})
}

// Function to update which education level the page is displaying
function updateEducationLevel() {
	// Toggle undergraduate mode
	if ($('#filters__undergraduate').is(':checked')) {
		$('.undergraduateOnly').show();
		$('.graduateOnly').hide();
	}
	// Toggle graduate mode
	else if ($('#filters__graduate').is(':checked')) {
		$('.graduateOnly').show();
		$('.undergraduateOnly').hide();
	}
	// Hide both
	else {
		$('.graduateOnly').hide();
		$('.undergraduateOnly').hide();
	}
}

// Function to update the program results
function updateResults() {

	// Get all the filter selections

	// Education level
	const undergraduateChecked = $('#filters__undergraduate').is(':checked');
	const graduateChecked = $('#filters__graduate').is(':checked');
	// Degree Type
	let filterSelectionsUndergraduateDegreeType = [];
	let filterSelectionsGraduateDegreeType = [];
	let filterSelectionsDegreeType = [];
	if (undergraduateChecked) {
		filterSelectionsUndergraduateDegreeType = getFilterSelections('.filterUndergraduateDegreeType');
		// If no specific degree types are checked, include all degrees of this level
		if (filterSelectionsUndergraduateDegreeType.length == 0) {
			filterSelectionsUndergraduateDegreeType = getFilterOptions('.filterUndergraduateDegreeType');
		}
	}
	else if (graduateChecked) {
		filterSelectionsGraduateDegreeType = getFilterSelections('.filterGraduateDegreeType');
		// If no specific degree types are checked, include all degrees of this level
		if (filterSelectionsGraduateDegreeType.length == 0) {
			filterSelectionsGraduateDegreeType = getFilterOptions('.filterGraduateDegreeType');
		}
	}
	filterSelectionsDegreeType = filterSelectionsUndergraduateDegreeType.concat(filterSelectionsGraduateDegreeType); // Combine into one array
	// Persona
	let filterSelectionsPersona = [];
	if (undergraduateChecked) {
		filterSelectionsPersona = getFilterSelections('.filterPersona');
	}
	// Delivery Method
	let filterSelectionsDeliveryMethod = [];
	filterSelectionsDeliveryMethod = getFilterSelections('.filterDeliveryMethod');
	// College
	let filterSelectionsCollege = [];
	filterSelectionsCollege = getFilterSelections('.filterCollege');


	// Process every card based on the filter selections
	let resultsFound = false;
	for (let i = 0; i < programDatabase.length; i++) {
		const thisProgramData = programDatabase[i];
		const thisProgramElement = `.programCard:nth-child(${i+1})`;

		// Compare data to filters, then hide or show
		let match = false;

		// Degree Type
		if (compareToFilterSelection(thisProgramData['Degree Type'], filterSelectionsDegreeType) == false) {
			// If not a match, hide this program and move onto the next program
			$(thisProgramElement).hide();
			continue;
		}
		// Persona
		if (compareToFilterSelection(thisProgramData['Persona'], filterSelectionsPersona) == false) {
			// If not a match, hide this program and move onto the next program
			$(thisProgramElement).hide();
			continue;
		}
		// Delivery Method
		if (compareToFilterSelection(thisProgramData['Delivery Method'], filterSelectionsDeliveryMethod) == false) {
			// If not a match, hide this program and move onto the next program
			$(thisProgramElement).hide();
			continue;
		}	
		// College
		if (compareToFilterSelection(thisProgramData['College'], filterSelectionsCollege) == false) {
			// If not a match, hide this program and move onto the next program
			$(thisProgramElement).hide();
			continue;
		}

		// If the program was not hidden by the end, show it!
		$(thisProgramElement).show();
		// Mark that we found at least one result
		resultsFound = true;
	}

	// Check if we need to display a "No results found" message
	if (resultsFound) {
		$('.noResultsMessage').hide();
	}
	else {
		$('.noResultsMessage').show();
	}

}

// Get the selections for a specific filter group
function getFilterSelections(filterClass) {
	// ex: filterClass = '.filterPersona'

	let selections = [];

	// Check each option to see if it's selected
	$(filterClass).each(function() {
		if ($(this).is(':checked')) {
			// If it is, add that option to the array
			let optionLabel = '';
			// Use value attribute if present
			if ($(this).attr('value')) {
				optionLabel = $(this).attr('value');
			}
			// Otherwise, use the text of the label
			else {
				optionLabel = $('label[for="' + this.id + '"]').html();
			}
			selections.push(optionLabel);
		}
	})

	return selections;
}


// Get every option a specific filter group (used for undergrad/grad degree types)
function getFilterOptions(filterClass) {
	// ex: filterClass = '.filterPersona'

	let options = [];

	// For each option
	$(filterClass).each(function() {
		// Add that option to the array
		let optionLabel = '';
		// Use value attribute if present
		if ($(this).attr('value')) {
			optionLabel = $(this).attr('value');
		}
		// Otherwise, use the text of the label
		else {
			optionLabel = $('label[for="' + this.id + '"]').html();
		}
		options.push(optionLabel);
	})

	return options;
}


function compareToFilterSelection(programDataValue, filterSelections) {
	// Return true to pass, return false to reject

	// Ignore case
	programDataValue = programDataValue.toLowerCase();

	// Skip this filter if nothing was selected, or is program data value is "All"
	if (filterSelections.length === 0 || programDataValue == "all") {
		return true;
	}
	else {
		// For each selection
		for (let i = 0; i < filterSelections.length; i++) {
			// Check if the program data string contains that selection string
			const thisSelection = filterSelections[i].toLowerCase();
			// Require an exact match for certificate filters, due to overlap
			if (thisSelection == "undergraduate certificate" || thisSelection == "graduate certificate") {
				if (programDataValue == thisSelection) {
					return true;
				}
			}
			// Otherwise, just see if the selection is included anywhere in the program data value
			else if (programDataValue.includes(thisSelection)) {
				return true;
			}
		}

		// If there's no match, return false
		return false;
	}
}



// Shortcut function for checking if a filter is checked
function filteredBy(elementID) {
	return $(elementID).is(':checked');
}


// =====================
// Accordion Stuff
// =====================
$(document).ready(function() {
	// On desktop, start with only the Degree Type accordion open
	if (window.innerWidth > 767) {
		startWithAccordionsOpen('accordionDegreeType');
		//startWithAccordionsOpen('accordionDegreeType,accordionPersona,accordionDeliveryMethod,accordionCollege');
	}
	// On mobile, start with only the Degree Type accordion open
	else {
		startWithAccordionsOpen('accordionDegreeType');
	}
})

function startWithAccordionsOpen(inputString) {
	if (inputString.length > 0) {
		let accordionsToOpen = inputString.split(",");
		for (let i = 0; i < accordionsToOpen.length; i++) {
			openAccordion(accordionsToOpen[i]);
		}
	}
}

function openAccordion(accordionID) {
	let thisAccordionID = '#' + accordionID; // Get accordion
	let thisTriggerID = thisAccordionID + '_panel_1_trigger'; // Get trigger
	let thisPanelID = thisAccordionID + '_panel_1'; // Get panel

	// Set attributes to opened state
	$(thisTriggerID).attr('aria-expanded', 'true');
	$(thisPanelID).attr('aria-hidden', 'false');
	$(thisPanelID).removeAttr('style');
}

function closeAccordion(accordionID) {
	let thisAccordionID = '#' + accordionID; // Get accordion
	let thisTriggerID = thisAccordionID + '_panel_1_trigger'; // Get trigger
	let thisPanelID = thisAccordionID + '_panel_1'; // Get panel

	// Set attributes to closed state
	$(thisTriggerID).attr('aria-expanded', 'false');
	$(thisPanelID).attr('aria-hidden', 'true');
	$(thisPanelID).css('height', '0px');
}

// Function to open the accordion containing an input
function openTheAccordionOfThisInput(element) {
	// Find the parent accordion and get its ID
	let parentID = $(element).closest('.accordion').attr('id');
	// Open the accordion
	openAccordion(parentID);
}
