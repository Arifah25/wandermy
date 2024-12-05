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

export const AI_PROMPT = 'Generate Travel Plan name {tripName} for Location : {location}, for {totalDay} Days and {totalNight} Nights for {traveler} with a {budget} budget with a public transport details options ,from {departure} public transport price (RM) with booking url, hotels option list with hotelname, hotel address, price (RM), hotel image url, geo coordinates, rating, descriptions and places {places} all these attributes should be store in the JSON file, ticket pricing (RM), geo coordinates, operating hour  (10:00 AM - 10:00 PM) , time to travel to each location for {totalDay} days and {totalNight} night with each day plan with the best time to visit for each place , add suggested places to visit not included in the places, the suggested  places should have the same attribute as the places stated but make sure it is separated from the places list variable isSuggested: true and make sure all image urls are real urls do not give placeholders, all these in JSON format'