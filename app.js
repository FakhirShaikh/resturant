let all_category_data = document.getElementById("all_category_data")
let Dish_name = document.getElementById("Dish_name")
let Dish_price = document.getElementById("Dish_price")
let dish_price_edit = document.getElementById("dish_price_edit")
let dish_name_edit = document.getElementById("dish_name_edit")
let edit_cat_option = document.getElementById("edit_cat_option")
let edit_cat_name = ""
let dish_key_save = ""
var edit_cat_key = ""
var edit_Cat_key_value =""
var Add_btn=document.getElementById("Add_btn")
var dbref = firebase.database().ref("dishes")
var dish_image_url = ""
let Dish_image = document.getElementById("Dish-image")
let dish_edit_image = document.getElementById("dish_edit_image")
var check = false
let dishes_data = document.getElementById("dishes_data")
let selectedDishKey=""
var last_key = ""


async function get_all_category() {
    all_category_data.innerHTML = ""
    await firebase.database().ref("category").get()
        .then((snap) => {
            // console.log(snap.val())
            var get_all_category_data = Object.values(snap.val())
            // console.log(get_all_category_data)
            for (var data in get_all_category_data) {
                console.log(get_all_category_data[data]["Category_key"])
                // console.log(get_all_category_data[data])
                all_category_data.innerHTML += `<option value=${get_all_category_data[data]["Category_key"]}>${get_all_category_data[data]["Category_name"]}
                </option>`
            
                edit_cat_option.innerHTML += `<option 
                value=${get_all_category_data[data]["Category_name"]}
                id=${get_all_category_data[data]["Category_key"]}>${get_all_category_data[data]["Category_name"]}
                </option>`

               
            }
        })
        .catch((e) => {
            console.log(e)
        })
}

Dish_image.addEventListener("change", function (e) {
    //  console.log(e.target.files[0]) 
    image_uplod(e)

})
function image_uplod(e) {
    var storageRef = firebase.storage().ref();
    var image_uploded = storageRef.child(`Dishes/${e.target.files[0].name}`).put(e.target.files[0]);
   
    image_uploded.on('state_change',
        (snapshot) => {
            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            Toastify({
                text: progress.toFixed(2) + "%",
                duration: 1000,
                style: {
                    background: "linear-gradient(to right, #00b09b, #96c93d)",
                },
            }).showToast();
            // console.log(progress)
        },
        (error) => {
            Toastify({

                text: error,

                duration: 2000

            }).showToast();
              
        },
        () => {
            image_uploded.snapshot.ref.getDownloadURL().then((url) => {
                dish_image_url = url
                dish_edit_image.src = dish_image_url
                Add_btn.disabled = false
            });
        }
    )
}

async function addDish() {
    // Add_btn.disabled = true
    var response = validateData()
    if (response) {
        if (check == false) {
            var dish_key = dbref.push().getKey();
            await firebase.database().ref("category").child(all_category_data.value)
                .get().then(async (snap) => {
                    // console.log(snap.val())
                    var category_name = snap.val()["Category_name"]

                    var object = {
                        Dish_name: Dish_name.value,
                        Dish_price: Dish_price.value,
                        Dish_image: dish_image_url,
                        dish_key: dish_key,
                        category_name: category_name,
                        Category_key: all_category_data.value,
                    }
                    // console.log(object)
                    await dbref.child(all_category_data.value).child(dish_key).set(object)

                    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('exampleModal'));
                    myModal.hide();

                    Toastify({
                        text: "New dish added",
                        duration: 2000,
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                        },
                    }).showToast();

                })
        }
        else {
            EditCategoryApi();
        }
        view_dishes_in_Table();
        
        Add_btn.disabled = true
        Dish_name.value = "";
        Dish_price.value = "";
        Dish_image.value= ""

    }
    else {

        Toastify({
            text: "Enter correct data",
            duration: 2000,
            style: {
                background: "linear-gradient(to right, #00b09b, #96c93d)",
            },
        }).showToast();
    }



}

async function view_dishes_in_Table() {
    dishes_data.innerHTML = ""
    var mainData = [];
    await dbref.get()
        .then((snapshot) => {
            // console.log(snapshot.val())
            if (snapshot.val() != undefined || snapshot.val() != null) {
                var dishes_data_value = Object.values(snapshot.val())
                // console.log(dishes_data_value)
                for (i = 0; i < dishes_data_value.length; i++) {
                    var newdata = Object.values(dishes_data_value[i])
                    // console.log(newdata)
                    for (var j in newdata) {
                        mainData.push(newdata[j])
                    }
                }
            }
        })
    for (i in mainData) {
        //                  console.log(mainData[i])
        dishes_data.innerHTML += `
                <div class="item1" >
                <h3 class="tr-td tr-td-No">${(Number(i) + 1)}</h3>
                <h3 class="tr-td tr-td-Name">${mainData[i]["category_name"]}</h3>
                <h3 class="tr-td tr-td-Name">${mainData[i]["Dish_name"]}</h3>
                <h3 class="tr-td tr-td-Name">${mainData[i]["Dish_price"]}</h3>
                <div class= "tr-td-image">
                <img class="Category_image" src="${mainData[i]["Dish_image"]}">
                </div>
                
                <div class="action-buttons">
                <button class="action-btn" value='${mainData[i]["Category_key"]}'>
                <img  src="../../images/icons/icons8-edit-30.png" data-bs-toggle="modal"
                data-bs-target="#exampleModaledit" onclick="editDish(this)"  id='${mainData[i]["dish_key"]}'>
                </button>
                <button class="action-buttons" value='${mainData[i]["Category_key"]}'>
                <img class="action-btn" src="../../images/icons/icons8-delete-30.png"  id='${mainData[i]["dish_key"]}' onclick="deleteDish(this)">
                </button>
                </div>
                </div>
                `
    }
}

async function editDish(e) {
    console.log(e.parentNode.parentNode.parentNode.childNodes[3].innerText)  
    let selectedCategoryKey = e.parentNode.value;
    // Set selectedDishKey here
    selectedDishKey = e.id;
    currentEditKey=selectedCategoryKey
    await dbref.child(selectedCategoryKey).child(e.id).get()
        .then((snap) => {
            // Set the value of the edit modal's category select element
            edit_cat_option.value = e.parentNode.parentNode.parentNode.childNodes[3].innerText;
            edit_cat_name = snap.val()["Category_name"]
            dish_name_edit.value = snap.val()["Dish_name"];
            dish_price_edit.value = snap.val()["Dish_price"];
            dish_key_save = snap.val()["dish_key"]
            dish_edit_image.src = snap.val()["Dish_image"];
            dish_edit_image.style.display = "inline";
            last_key = snap.val()["Category_key"]
            
            
        })
        .catch((error) => {
            console.log(error);
        });
}

async function editSave(){
    // console.log(edit_cat_option.value)
    // console.log(dish_name_edit.value)
    // console.log(dish_price_edit.value)
    console.log(edit_Cat_key_value)
    // var dish_key = dbref.push()
    await firebase.database().ref("dishes").get()
                .then( async (snap)=>{
                    console.log(snap.val())
                    if(last_key ==  edit_Cat_key_value ){
                        var object = {
                            Dish_name: dish_name_edit.value,
                            Dish_price: dish_price_edit.value,
                            Dish_image: dish_edit_image.src,
                            dish_key: dish_key_save,
                            category_name:edit_cat_name,
                            Category_key: edit_Cat_key_value,
                        }
    
                    console.log(object)
                   await  firebase.database().ref("dishes").child(edit_Cat_key_value)
                   .child(dish_key_save).update(object)
    
                    Toastify({
                                        text: "Dish updated successfully",
                                        duration: 2000,
                                        style: {
                                            background: "linear-gradient(to right, #00b09b, #96c93d)"
                                        }
                                    }).showToast();

                    }
                    else{
                        var object = {
                            Dish_name: dish_name_edit.value,
                            Dish_price: dish_price_edit.value,
                            Dish_image: dish_edit_image.src,
                            dish_key: dish_key_save,
                            category_name:edit_cat_name,
                            Category_key: edit_Cat_key_value,
                        }
    
                    console.log(object)
                    await  firebase.database().ref("dishes").child(last_key).remove()
                   await  firebase.database().ref("dishes").child(edit_Cat_key_value)
                   .child(dish_key_save).update(object)
    
                    Toastify({
                                        text: "Dish updated successfully",
                                        duration: 2000,
                                        style: {
                                            background: "linear-gradient(to right, #00b09b, #96c93d)"
                                        }
                                    }).showToast();
                    }
    //                 // var editedCategoryName = edit_cat_option.options[edit_cat_option.selectedIndex].text;
    //                 // var edit_category_name = snap.val()["edit_cat_option.value()"]

    //                 // edit_Cat_key_value = edit_cat_option[i].id
    //                 // edit_cat_name =edit_cat_option[i].value
                  
                })

                
                var myModaledit = bootstrap.Modal.getOrCreateInstance(document.getElementById('exampleModaledit'));
                            myModaledit.hide()

                view_dishes_in_Table()

                .catch((e)=>{
                    console.log(e)
                    Toastify({
                        text: "Error",
                        duration: 2000,
                        style: {
                            background: "linear-gradient(to right, #00b09b, #96c93d)",
                        },
                    }).showToast();
                })

        
                Add_btn.disabled = true
                edit_cat_option="";
                dish_name_edit.value = "";
                dish_price_edit.value = "";
                dish_edit_image.src= "";
}


function setCategoryFunc(e){
    console.log(e.value)
    for(var i=1;i<edit_cat_option.length;i++){

        if(edit_cat_option[i].value==e.value){
            console.log(edit_cat_option[i])
            edit_Cat_key_value = edit_cat_option[i].id
            edit_cat_name =edit_cat_option[i].value



        }

    }
   
    // for(var i in edit_cat_option){
    //     console.log(edit_cat_option[i])
    // }
    // edit_cat_option= e.value

}

// chat GPT 
// async function editSave() {
   
   
//     var updateObject = {
//         Dish_name: dish_name_edit.value,
//         Dish_price: dish_price_edit.value,
//         Dish_image: dish_edit_image.src
//     };

//     await dbref.child(edit_cat_option.value).child(selectedDishKey).update(updateObject)
//         .then(() => {
//             // Get the edited category name
//             var editedCategoryName = edit_cat_option.options[edit_cat_option.selectedIndex].text;
//             console.log("Edited Category Name:", editedCategoryName);

//             Toastify({
//                 text: "Dish updated successfully",
//                 duration: 2000,
//                 style: {
//                     background: "linear-gradient(to right, #00b09b, #96c93d)"
//                 }
//             }).showToast();

//             // Clear input fields and hide modal
//             dish_name_edit.value = "";
//             dish_price_edit.value = "";
//             dish_edit_image.src = "";
//             var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('exampleModal'));
//             myModal.hide();

//             // Refresh dishes table
//             view_dishes_in_Table();
//         })
//         .catch((error) => {
//             console.error("Error updating dish:", error);
//             Toastify({
//                 text: "Error updating dish",
//                 duration: 2000,
//                 style: {
//                     background: "linear-gradient(to right, #ff6c6c, #ff9e9e)"
//                 }
//             }).showToast();
//         });
// }



async function EditCategoryApi(){
    console.log(selectedDishKey)
    var updateobject={
        category_name:edit_cat_option.value,
        Dish_name:dish_name_edit.value,
        Dish_price:dish_price_edit.value,
        Dish_image:dish_image_url,


    }
    console.log(updateobject)
    await dbref.child(selectedDishKey).update(updateobject)
    Toastify({
        text: "edit Category",
       duration: 2000,
       style: {
  background: "linear-gradient(to right, #00b09b, #96c93d)",
},
    }).showToast();
    var myModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('exampleModal'));
    myModal.hide();
}


async function deleteDish(deletebtn_key) {
        // console.log(deletebtn_key.parentNode.parentNode.parentNode)
        // console.log(deletebtn_key.id)
        deletebtn_key.parentNode.parentNode.parentNode.remove()
    dbref.child(deletebtn_key.id).remove()
}
function validateData() {
    if (Dish_name.value != "" && dish_image_url != "" && Dish_price.value != "") {
        return true
    }
    else {
        return false
    }
}

view_dishes_in_Table()
get_all_category()  