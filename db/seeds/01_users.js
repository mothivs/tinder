/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del()
  await knex('users').insert([
    { firstName: "Dev", lastName: "Rao", userName: "devrao76", email: "devrao76@example.com", password: "password123", phoneNumber: "+919139761700", gender: "Non-binary" },
  { firstName: "Riya", lastName: "Sen", userName: "riyasen95", email: "riyasen95@example.com", password: "password123", phoneNumber: "+919307245808", gender: "Female" },
  { firstName: "Siddharth", lastName: "Mehra", userName: "siddharthmehra55", email: "siddharthmehra55@example.com", password: "password123", phoneNumber: "+919331105900", gender: "Male" },
  { firstName: "Kabir", lastName: "Joshi", userName: "kabirjoshi90", email: "kabirjoshi90@example.com", password: "password123", phoneNumber: "+918119997696", gender: "Male" },
  { firstName: "Rohan", lastName: "Das", userName: "rohandas75", email: "rohandas75@example.com", password: "password123", phoneNumber: "+917659929844", gender: "Male" },
  { firstName: "Rahul", lastName: "Mehra", userName: "rahulmehra49", email: "rahulmehra49@example.com", password: "password123", phoneNumber: "+919191458517", gender: "Male" },
  { firstName: "Kavya", lastName: "Malhotra", userName: "kavyamalhotra80", email: "kavyamalhotra80@example.com", password: "password123", phoneNumber: "+919556428822", gender: "Female" },
  { firstName: "Meera", lastName: "Kapoor", userName: "meerakapoor98", email: "meerakapoor98@example.com", password: "password123", phoneNumber: "+917777812649", gender: "Female" },
  { firstName: "Sneha", lastName: "Mehra", userName: "snehamehra14", email: "snehamehra14@example.com", password: "password123", phoneNumber: "+919370996806", gender: "Female" },
  { firstName: "Kavya", lastName: "Gupta", userName: "kavyagupta74", email: "kavyagupta74@example.com", password: "password123", phoneNumber: "+918205178383", gender: "Female" },
  { firstName: "Aditya", lastName: "Kumar", userName: "adityakumar14", email: "adityakumar14@example.com", password: "password123", phoneNumber: "+919161300581", gender: "Male" },
  { firstName: "Ananya", lastName: "Kumar", userName: "ananyakumar83", email: "ananyakumar83@example.com", password: "password123", phoneNumber: "+918947910019", gender: "Female" },
  { firstName: "Vihaan", lastName: "Das", userName: "vihaandas86", email: "vihaandas86@example.com", password: "password123", phoneNumber: "+917107571320", gender: "Male" },
  { firstName: "Ananya", lastName: "Rao", userName: "ananyarao68", email: "ananyarao68@example.com", password: "password123", phoneNumber: "+917454492535", gender: "Female" },
  { firstName: "Pooja", lastName: "Choudhury", userName: "poojachoudhury10", email: "poojachoudhury10@example.com", password: "password123", phoneNumber: "+918701152925", gender: "Female" },
  { firstName: "Amit", lastName: "Kumar", userName: "amitkumar26", email: "amitkumar26@example.com", password: "password123", phoneNumber: "+918804520134", gender: "Male" },
  { firstName: "Kabir", lastName: "Choudhury", userName: "kabirchoudhury18", email: "kabirchoudhury18@example.com", password: "password123", phoneNumber: "+918827495795", gender: "Male" },
  { firstName: "Amit", lastName: "Bose", userName: "amitbose48", email: "amitbose48@example.com", password: "password123", phoneNumber: "+917199381245", gender: "Male" },
  { firstName: "Isha", lastName: "Patel", userName: "ishapatel69", email: "ishapatel69@example.com", password: "password123", phoneNumber: "+919497760714", gender: "Female" },
  { firstName: "Ananya", lastName: "Verma", userName: "ananyaverma32", email: "ananyaverma32@example.com", password: "password123", phoneNumber: "+917193494983", gender: "Female" }
  ]);
};
