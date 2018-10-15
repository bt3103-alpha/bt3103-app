var app;

window.onload = function() {
    var db = firebase.initializeApp({
        databaseURL: 'https://bt3103-alpha-student.firebaseio.com/'
    }).database();

    var profileDb = db.ref('profile')

    app = new Vue({
        el: '#app',
        firebase: {
            profile: {
                source: db.ref('profile'),
                asObject: true, 
                readyCallback: function() {
                    this.loaded = true;
                }
            }
        }, 
        data: {
            loaded: false,
            courses: {
                'Business': ['Accounting', 'Business Administration'], 
                'Computing': ['Business Analytics', 'Computer Science', 'Information Security', 'Information Systems'], 
                'Dentistry': ['Dentistry'],
                'Engineering': ['Biomedical', 'Civil', 'Chemical', 'Computer', 'Electrical', 'Environmental', 'Industrial & Systems', 'Materials Science', 'Mechanical'],
                'Law': ['Law'],
                'Medicine': ['Medicine'],
                'Nursing': ['Nursing']
            }
        }, 
        methods: {
            updateProfile: function(field, newValue){
                profileDb.child(field).set(newValue);
            }
        }
    });
}