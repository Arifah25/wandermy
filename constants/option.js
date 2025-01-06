export const SelectTravelList=[
    {
        id: 1,
        title: 'Just Me',
        desc: 'A solo traveler',
        people: '1',
        icon: '🎒'
    },
    {
        id: 2,
        title: 'Couples',
        desc: 'Two travelers in tandem',
        people: '2 people',
        icon: '👫'
    },
    {
        id: 3,
        title: 'Family',
        desc: 'A group of fun loving adventure',
        people: '3 to 5 people',
        icon: '👨‍👩‍👧‍👦'
    },
    {
        id: 4,
        title: 'Group',
        desc: 'A group of friends or colleagues',
        people: '5 or more people',
        icon: '✈️'
    }
]

export const SelectBudgetList=[
    {
        id: 1,
        title: 'Cheap',
        desc: 'Budget friendly trip',
        icon: '💵'
    },
    {
        id: 2,
        title: 'Standard',
        desc: 'Keep cost on the average',
        icon: '💰'
    },
    {
        id: 3,
        title: 'Luxury',
        desc: "Don't worry about cost",
        icon: '💎'
    }
]

export const AI_PROMPT = "create a {totalDays} days and {totalNights} nights {tripName} itinerary for a trip to {destination} for a {traveler} with a {budget} budget, from {origin} based on these places only : {places} , include details like \n Public Transport: suggest train or bus options (in array) with estimated prices and booking links \n Accomodation: 2-3 hotels options  with prices, booking url, locations, ratings. \nItinerary:\nPlan activities for the day.\nSort the places based on their location to ease the movement(efficient), including suggested time to visit, budget per person, and hours to spend at each place.\nInclude all the provided places, even if they are far.\nStore the placeID of each place in the itinerary.\nDO NOT ADD ANY OTHER PLACES that is not included in the array \n\nALL IN JSON FORMAT. "