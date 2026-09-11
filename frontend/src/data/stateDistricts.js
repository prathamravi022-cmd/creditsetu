/**
 * All 36 Indian States & Union Territories with real district names.
 * Source: Census of India / data.gov.in
 * Used by OnboardingWizard for state -> district cascading dropdown.
 */

export const STATE_DISTRICTS = {
  "Andaman and Nicobar Islands": ["South Andaman", "North and Middle Andaman", "Nicobar"],
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari", "YSR Kadapa", "Anakapalli", "Annamayya", "Bapatla", "Eluru", "NTR", "Palnadu", "Tirupati", "Nandyal"],
  "Arunachal Pradesh": ["Tawang", "West Kameng", "East Kameng", "Papum Pare", "Kurung Kumey", "Lower Subansiri", "Upper Subansiri", "West Siang", "East Siang", "Siang", "Upper Siang", "Lower Dibang Valley", "Dibang Valley", "Anjaw", "Lohit", "Namsai", "Changlang", "Tirap", "Longding"],
  "Assam": ["Tinsukia", "Dibrugarh", "Sivasagar", "Jorhat", "Golaghat", "Karbi Anglong", "Nagaon", "Sonitpur", "Lakhimpur", "Dhemaji", "Darrang", "Kamrup Metropolitan", "Kamrup", "Nalbari", "Barpeta", "Bongaigaon", "Kokrajhar", "Dhubri", "Goalpara", "Hailakandi", "Karimganj", "Cachar", "Dima Hasao", "Hojai", "Biswanath", "Charaideo", "Majuli"],
  "Bihar": ["Patna", "Nalanda", "Gaya", "Jehanabad", "Aurangabad", "Rohtas", "Buxar", "Bhagalpur", "Banka", "Munger", "Khagaria", "Samastipur", "Darbhanga", "Madhubani", "Sitamarhi", "Sheohar", "East Champaran", "West Champaran", "Muzaffarpur", "Vaishali", "Saran", "Siwan", "Gopalganj", "Nawada", "Sheikhpura", "Lakhisarai", "Jamui", "Kaimur", "Araria", "Kishanganj", "Purnia", "Katihar", "Supaul", "Madhepura", "Saharsa"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bilaspur", "Durg", "Rajnandgaon", "Jagdalpur", "Ambikapur", "Korba", "Raigarh", "Janjgir-Champa", "Dhamtari", "Mahasamund", "Kabirdham", "Bemetara", "Bastar", "Dantewada", "Kondagaon", "Narayanpur", "Bijapur", "Kanker", "Gariaband", "Balod", "Baloda Bazar", "Guru Ghasidas", "Surajpur", "Balrampur"],
  "Dadra and Nagar Haveli and Daman and Diu": ["Dadra and Nagar Haveli", "Daman", "Diu"],
  "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Mehsana", "Bharuch", "Bhuj", "Porbandar", "Patan", "Banaskantha", "Sabarkantha", "Panchmahal", "Dahod", "Valsad", "Tapi", "Navsari", "Amreli", "Surendranagar", "Morbi", "Kutch", "Devbhumi Dwarka", "Gir Somnath", "Aravalli", "Chhota Udaipur", "Kheda"],
  "Haryana": ["Faridabad", "Gurgaon", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat", "Jhajjar", "Bhiwani", "Mahendragarh", "Jind", "Kurukshetra", "Kaithal", "Palwal", "Nuh", "Fatehabad", "Sirsa", "Rewari", "Panchkula", "Yamunanagar"],
  "Himachal Pradesh": ["Shimla", "Kullu", "Mandi", "Kangra", "Hamirpur", "Bilaspur", "Una", "Chamba", "Sirmaur", "Solan", "Kinnaur", "Lahaul Spiti"],
  "Jammu and Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Budgam", "Pulwama", "Kupwara", "Bandipora", "Ganderbal", "Shopian", "Kulgam", "Poonch", "Rajouri", "Reasi", "Kathua", "Samba", "Udhampur", "Doda", "Kishtwar", "Ramban"],
  "Jharkhand": ["Ranchi", "Dhanbad", "Jamshedpur", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Koderma", "Chatra", "Lohardaga", "Gumla", "Simdega", "Khunti", "Palamu", "Latehar", "Godda", "Sahebganj", "Pakur", "Dumka", "Jamtara", "East Singhbhum", "West Singhbhum", "Seraikela Kharsawan"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Mangaluru", "Hubli-Dharwad", "Belgaum", "Gulbarga", "Bidar", "Raichur", "Bellary", "Mandya", "Tumakuru", "Shimoga", "Davangere", "Chitradurga", "Kolar", "Chikkaballapur", "Ramanagara", "Hassan", "Chamarajanagar", "Kodagu", "Dakshina Kannada", "Uttara Kannada", "Udupi", "Haveri", "Bagalkot", "Vijayapura", "Yadgir", "Chikkamagaluru"],
  "Kerala": ["Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam", "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod"],
  "Ladakh": ["Leh", "Kargil"],
  "Lakshadweep": ["Lakshadweep"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Satna", "Rewa", "Dewas", "Katni", "Ratlam", "Mandsaur", "Neemuch", "Chhindwara", "Balaghat", "Narsinghpur", "Seoni", "Mandla", "Dindori", "Betul", "Hoshangabad", "Raisen", "Vidisha", "Sehore", "Rajgarh", "Shajapur", "West Nimar", "East Nimar", "Barwani", "Khargone", "Burhanpur", "Khandwa", "Dhar", "Jhabua", "Alirajpur", "Niwari", "Tikamgarh", "Chhatarpur", "Damoh", "Panna"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Sangli", "Amravati", "Jalgaon", "Akola", "Latur", "Nanded", "Ahmednagar", "Chandrapur", "Yavatmal", "Parbhani", "Hingoli", "Wardha", "Bhandara", "Gondia", "Raigad", "Ratnagiri", "Sindhudurg", "Palghar", "Dhule", "Nandurbar", "Satara", "Beed", "Dharashiv", "Jalna", "Washim", "Buldhana", "Gadchiroli"],
  "Manipur": ["Imphal West", "Imphal East", "Thoubal", "Bishnupur", "Churachandpur", "Ukhrul", "Senapati", "Tengnoupal", "Pherzawl", "Chandel", "Noney", "Tamenglong", "Jiribam", "Kamjong"],
  "Meghalaya": ["East Khasi Hills", "West Khasi Hills", "South West Khasi Hills", "East Jaintia Hills", "West Jaintia Hills", "East Garo Hills", "West Garo Hills", "South Garo Hills", "South West Garo Hills", "North Garo Hills", "Ri-Bhoi", "Eastern West Khasi Hills"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Kolasib", "Lawngtlai", "Mamit", "Saitual", "Hnahthial", "Khawzawl", "Serchhip"],
  "Nagaland": ["Kohima", "Mokokchung", "Tuensang", "Mon", "Wokha", "Zunheboto", "Phek", "Dimapur", "Longleng", "Kiphire", "Peren", "Noklak", "Chumoukedima", "Tseminyu", "Niuland"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Puri", "Sambalpur", "Berhampur", "Rourkela", "Balasore", "Mayurbhanj", "Bargarh", "Jharsuguda", "Sundargarh", "Keonjhar", "Angul", "Dhenkanal", "Jajpur", "Kendrapara", "Jagatsinghpur", "Nayagarh", "Khordha", "Ganjam", "Gajapati", "Kandhamal", "Boudh", "Subarnapur", "Bolangir", "Kalahandi", "Nuapada", "Koraput", "Malkangiri", "Rayagada", "Nabarangapur", "Deogarh", "Sonepur"],
  "Puducherry": ["Puducherry", "Karaikal", "Mahe", "Yanam"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Hoshiarpur", "Gurdaspur", "Moga", "Sangrur", "Firozpur", "Kapurthala", "Rupnagar", "SAS Nagar", "Pathankot", "Mansa", "Faridkot", "Fazilka", "Tarn Taran", "Muktsar", "Barnala", "SBS Nagar", "Malerkotla"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Ajmer", "Udaipur", "Bikaner", "Alwar", "Bharatpur", "Sikar", "Pali", "Bhilwara", "Hanumangarh", "Dholpur", "Churu", "Baran", "Dausa", "Jhalawar", "Jhunjhunu", "Nagaur", "Tonk", "Banswara", "Chittorgarh", "Rajsamand", "Pratapgarh", "Dungarpur", "Bundi", "Barmer", "Jaisalmer", "Sirohi", "Jalore", "Karauli", "Sawai Madhopur", "Ganganagar"],
  "Sikkim": ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim", "Pakyong", "Soreng"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Dindigul", "Kanchipuram", "Cuddalore", "Tiruvallur", "Krishnagiri", "Dharmapuri", "Namakkal", "Karur", "Nilgiris", "Perambalur", "Ariyalur", "Ramanathapuram", "Virudhunagar", "Theni", "Sivaganga", "Tiruppur"],
  "Telangana": ["Hyderabad", "Rangareddy", "Medchal", "Warangal", "Nalgonda", "Karimnagar", "Nizamabad", "Khammam", "Mahbubnagar", "Adilabad", "Medak", "Sangareddy", "Bhupalpally", "Jagitial", "Mancherial", "Peddapalli", "Mulugu", "Bhadradri Kothagudem", "Suryapet", "Mahabubabad", "Wanaparthy", "Nagarkurnool", "Vikarabad", "Siddipet", "Jangaon"],
  "Tripura": ["West Tripura", "Sepahijala", "Gomati", "South Tripura", "North Tripura", "Unakoti", "Dhalai", "Khowai"],
  "Uttar Pradesh": ["Lucknow", "Varanasi", "Agra", "Prayagraj", "Kanpur Nagar", "Kanpur Dehat", "Gorakhpur", "Noida", "Meerut", "Aligarh", "Moradabad", "Bareilly", "Jhansi", "Ghaziabad", "Sitapur", "Hardoi", "Unnao", "Rae Bareli", "Fatehpur", "Banda", "Mahoba", "Hamirpur", "Jalaun", "Lalitpur", "Chitrakoot", "Kaushambi", "Pratapgarh", "Amethi", "Ayodhya", "Sultanpur", "Ambedkar Nagar", "Barabanki", "Bahraich", "Shravasti", "Gonda", "Basti", "Siddharthnagar", "Kushinagar", "Maharajganj", "Deoria", "Azamgarh", "Mau", "Ballia", "Ghazipur", "Jaunpur", "Mirzapur", "Sonbhadra", "Bhadohi", "Chandauli", "Pilibhit", "Shahjahanpur", "Budaun", "Rampur", "Sambhal", "Bijnor", "Amroha", "Hapur", "Bulandshahr", "Mainpuri", "Etawah", "Kannauj", "Firozabad", "Etah", "Hathras", "Mathura"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Mussoorie", "Nainital", "Almora", "Champawat", "Bageshwar", "Pithoragarh", "Udham Singh Nagar", "Tehri Garhwal", "Garhwal", "Pauri", "Chamoli", "Uttarkashi"],
  "West Bengal": ["Kolkata", "Howrah", "Hooghly", "North 24 Parganas", "South 24 Parganas", "Bardhaman", "Murshidabad", "Malda", "Siliguri", "Asansol", "Durgapur", "Bolpur", "Birbhum", "Purba Medinipur", "Paschim Medinipur", "Bankura", "Purulia", "Jhargram", "Cooch Behar", "Alipurduar", "Jalpaiguri", "Darjeeling", "Nadia", "Kalimpong"],
};

export const INDIAN_STATES = Object.keys(STATE_DISTRICTS).sort();

export const TOTAL_DISTRICTS = 690;
