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

export const AI_PROMPT = 'Generate Travel Plan name {tripName} for Location : {location}, for {totalDay} Days and {totalNight} Nights for {traveler} with a {budget} budget with a flight details, flight price with booking url, hotels option list with hotelname, hotel address, price, hotel image url, geo coordinates, rating, descriptions and places to visit nearby with placename, place details, place image url, geo coordinates, ticket pricing, operating hour, time to travel each of the location for {totalDays} Days and {totalNights} Nights with each day plan with best time to visit in JSON format'