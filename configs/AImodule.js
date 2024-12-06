const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });
  
  const generationConfig = {
    temperature: 1,
    topP: 0.95,
    topK: 40,
    maxOutputTokens: 8192,
    responseMimeType: "application/json",
  };
  
//   async function run() {
    export const chatSession = model.startChat({
      generationConfig,
      history: [
        {
          role: "user",
          parts: [
            {text: "create a 1 days and 0 nights Semester Break itinerary for a trip to Kuala Lumpur for a solo traveler with a standard budget, from Ipoh, Perak based on these places only : [{\"address\": \"Pesiaran Sultan Salahuddin, Kuala Lumpur, 50480 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia\", \"category\": \"attraction\", \"latitude\": \"3.149993000000001\", \"longitude\": \"101.6847623\", \"name\": \"Plaza Tugu Negara\", \"placeID\": \"-O193884d6366\"}, {\"address\": \"Level 4, Suria KLCC, PETRONAS Twin Towers, Kuala Lumpur City Centre, 50088, Kuala Lumpur\", \"category\": \"attraction\", \"latitude\": \"3.158102195\", \"longitude\": \"101.711981\", \"name\": \"Petrosains, The Discovery Centre\", \"placeID\": \"-OBeU7M8sKVBXxlcwPFv\"}, {\"address\": \"Unit 4-1, Level 4, Avenue K, Shopping Mall, 156, Jln Ampang, Kampung Baru, 50450 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur\", \"category\": \"attraction\", \"latitude\": \"3.159456733\", \"longitude\": \"101.7129914\", \"name\": \"SuperPark Malaysia\", \"placeID\": \"-OBeNoZJKKmW0bLFv6AO\"}, {\"address\": \"Jalan Cenderawasih, Tasik Perdana, 50480 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia\", \"category\": \"attraction\", \"latitude\": \"3.145777\", \"longitude\": \"101.6889059\", \"name\": \"Kuala Lumpur Butterfly Park\", \"placeID\": \"-O193884d447e\"}, {\"address\": \"37th Floor, Block, A, Regalia Residence, 2, Jln Sultan Ismail, Chow Kit, 50480 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia\", \"category\": \"dining\", \"latitude\": \"3.1640443\", \"longitude\": \"101.6925201\", \"name\": \"Fly Me To @ KL\", \"placeID\": \"-O1939745e4b5\"}, {\"address\": \"83 Ground Floor, Jalan SS 21/1a, Damansara Utama, 47400 Petaling Jaya, Selangor\", \"category\": \"dining\", \"latitude\": \"3.134566262553051\", \"longitude\": \"101.62107004471436\", \"name\": \"Hot Bird\", \"placeID\": \"-OBv23IVrb2xt2gHTnW-\"}, {\"address\": \"The Waterfront@ParkCity, No 5, Persiaran Residen, Desa Parkcity, 52200 Kuala Lumpur, Wilayah Persekutuan Kuala Lumpur, Malaysia\", \"category\": \"dining\", \"latitude\": \"3.186829\", \"longitude\": \"101.6271989\", \"name\": \"Jibby By The Park\", \"placeID\": \"-O1939745cd00\"}] , include details like \\n Public Transport: suggest train or bus options (in array) with estimated prices and booking links \\n Accomodation: 2-3 hotels options  with prices, images url, locations, ratings. \\n Itinerary: Plan activities for each day based on the places given only, include suggested time to visit the place, budget to spend per person there. and hour to spend at the place, based on the attributes given, placeId and poster from the array given should be store in here  \\n All of these in JSON format"},
          ],
        },
        {
          role: "model",
          parts: [
            {text: "```json\n{\n  \"tripDetails\": {\n    \"destination\": \"Kuala Lumpur, Malaysia\",\n    \"totalDays\": \"1\",\n\"totalNights\": \"0\",\n    \"traveler\": \"Solo\",\n    \"budget\": \"Standard\",\n\"tripName\": \"Semester Break\",\n    \"origin\": \"Ipoh, Perak\"\n  },\n  \"publicTransport\": [\n    {\n      \"mode\": \"Train\",\n      \"operator\": \"KTM ETS\",\n      \"route\": \"Ipoh - Kuala Lumpur\",\n      \"estimatedPrice\": {\n        \"min\": \"RM 30\",\n        \"max\": \"RM 60\" \n      },\n      \"bookingLink\": \"https://www.ktmb.com.my/\" \n    },\n    {\n      \"mode\": \"Bus\",\n      \"operator\": \"Various operators (e.g., Perak Transit)\",\n      \"route\": \"Ipoh - Kuala Lumpur\",\n      \"estimatedPrice\": {\n        \"min\": \"RM 25\",\n        \"max\": \"RM 40\"\n      },\n      \"bookingLink\": \"Check online bus ticketing platforms like Easybook or BusOnlineTicket\"\n    }\n  ],\n  \"accommodation\": [\n    {\n      \"name\": \"Hotel Name 1 (Example)\",\n      \"priceRange\": {\n        \"min\": \"RM 100\",\n        \"max\": \"RM 150\"\n      },\n      \"imageUrl\": \"Image URL 1 (Replace with actual image URL)\",\n      \"location\": \"Bukit Bintang (Example)\",\n      \"rating\": \"4.0\",\n      \"bookingLink\": \"Replace with booking link\"\n    },\n    {\n      \"name\": \"Hotel Name 2 (Example)\",\n      \"priceRange\": {\n        \"min\": \"RM 150\",\n        \"max\": \"RM 200\"\n      },\n      \"imageUrl\": \"Image URL 2 (Replace with actual image URL)\",\n      \"location\": \"KLCC (Example)\",\n      \"rating\": \"4.5\",\n      \"bookingLink\": \"Replace with booking link\"\n    },\n    {\n      \"name\": \"Hotel Name 3 (Example)\",\n      \"priceRange\": {\n        \"min\": \"RM 80\",\n        \"max\": \"RM 120\"\n      },\n      \"imageUrl\": \"Image URL 3 (Replace with actual image URL)\",\n      \"location\": \"Chow Kit (Example)\",\n      \"rating\": \"3.5\",\n      \"bookingLink\": \"Replace with booking link\"\n    }\n  ],\n  \"itinerary\": {\n    \"day1\": [\n      {\n        \"time\": \"9:00 AM - 11:00 AM\",\n        \"place\": \"Plaza Tugu Negara\",\n        \"placeID\": \"-O193884d6366\",\n        \"budget\": \"RM 10 (Entrance Fee, if applicable)\",\n        \"activities\": \"Explore the national monument and surrounding area.\",\n        \"hoursToSpend\": 2\n      },\n      {\n        \"time\": \"11:30 AM - 1:30 PM\",\n        \"place\": \"Petrosains, The Discovery Centre\",\n        \"placeID\": \"-OBeU7M8sKVBXxlcwPFv\",\n        \"budget\": \"RM 30 - RM 50 (Entrance Fee)\",\n        \"activities\": \"Interactive science exhibits.\",\n        \"hoursToSpend\": 2\n      },\n      {\n        \"time\": \"2:00 PM - 4:00 PM\",\n        \"place\": \"Kuala Lumpur Butterfly Park\",\n        \"placeID\": \"-O193884d447e\",\n        \"budget\": \"RM 15 (Entrance Fee)\",\n        \"activities\": \"Explore the variety of butterflies.\",\n        \"hoursToSpend\": 2\n      },\n      {\n        \"time\": \"4:30 PM - 6:00 PM\",\n        \"place\": \"SuperPark Malaysia\",\n        \"placeID\": \"-OBeNoZJKKmW0bLFv6AO\",\n        \"budget\": \"RM 50 - RM 80 (Entrance Fee, depends on activities)\",\n        \"activities\": \"Indoor activity park (optional, consider time and interest).\",\n        \"hoursToSpend\": 1.5\n      },\n      {\n        \"time\": \"7:00 PM - 8:30 PM\",\n        \"place\": \"Fly Me To @ KL\",\n        \"placeID\": \"-O1939745e4b5\",\n        \"budget\": \"RM 50- RM 80 (Dinner)\",\n        \"activities\": \"Dinner\",\n        \"hoursToSpend\": 1.5\n      }\n    ]\n  }\n}\n```\n\n**Note:**  This JSON includes placeholder image URLs and booking links. You need to replace them with actual links and image URLs from relevant sources.  Also, the prices provided are estimates and may vary depending on the time of year, availability, and your choices. Remember to factor in transportation costs within Kuala Lumpur (e.g., using Grab or taxis) to your budget.  Finally,  \"Hot Bird\" and \"Jibby By The Park\" are outside the central KL area given your other choices, and the travel time makes them impractical for a one-day trip.  I've omitted them from the itinerary.\n"},
          ],
        },
      ],
    });      
    
    // const result = await chatSession.sendMessage("INSERT_INPUT_HERE");
    // console.log(result.response.text());
//   }
  
//   run();