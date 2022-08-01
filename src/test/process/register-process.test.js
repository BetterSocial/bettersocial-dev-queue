/**
 * job data:  {
  token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiMDlkNDgyMDItOTUzNS00MmRiLTkzNDUtNzU1MjdiNmFhY2I4IiwiZXhwIjoxNjU5NjI0MTc1fQ.MenYtyFNnF7xK0DDLa5b0c-A9IGy4ltCn6GjaqmLY4w',
  userId: '09d48202-9535-42db-9345-75527b6aacb8',
  locationsChannel: [ '', 'adjuntas,-pr' ],
  follows: [
    'SSS2-AAA2-MMM2-PPP2-LLE2',
    '6fff4a2c-28d3-46e0-b2e8-7d04934af5b8'
  ],
  topics: [ 'Black' ],
  locations: [
    {
      location_id: '2',
      zip: '',
      neighborhood: '',
      city: 'Adjuntas, PR',
      state: 'Puerto Rico',
      country: 'US',
      location_level: 'City',
      status: 'Y',
      slug_name: '',
      createdAt: '2022-05-30T07:15:24.000Z',
      updatedAt: '2022-05-30T07:15:24.000Z'
    }
  ]
}
 */

const UserService = require("../../services/postgres/UserService")

describe('testing prepopulated dm', () => {
    it('user admin ada', () => {
        let userService = new UserService();
        let userAdmin = await userService.getUserAdmin(process.env.USERNAME_ADMIN);
        expect(true, true)
    })
})
