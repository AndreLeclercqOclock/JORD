let dbReady = new CustomEvent( 'dbReady', { bubbles: true } )
let pageReady = new CustomEvent( 'pageReady', { bubbles: true } )
let initWebsite = new CustomEvent( 'initWebsite', { bubbles: true } )

let routeList = [ ]
let route
let currentPage

class Router {

    constructor( routes ) {

        this.routes = routes
        this.cache = { }

        window.addEventListener( 'hashchange', this.loadPage.bind( this ) )
        document.addEventListener( 'dbReady', this.loadPage.bind( this ) )
    }

    async loadPage( e ){

        route = location.hash || '#'

        currentPage = Object.values(this.routes).find( elt => route === `#${elt.slug}` )

        if( currentPage === undefined ){

            currentPage = Object.values(this.routes).find( elt => `#${elt.slug}` === '#404' )
            route = '#404'

        } else {

            if( currentPage.access === '1' ){

                let userLocal = localStorage.getItem('userLocal')
                if( userLocal ) {

                    ( ( ) => { fetch(`/api/token?token=${userLocal}&action=verify`)
                        .then( res => {
                            return res.json()
                        })
                        .then( data => {
                            if ( data != true ) {
                                currentPage = Object.values(this.routes).find(elt => `#${elt.slug}` === '#401')
                                route = '#401'
                                showPage.bind( this )( )
                                localStorage.removeItem( 'userLocal' )
                            } else {
                                showPage.bind( this )( )
                            }
                        } )
                    } )( )

                } else {
                    route = '#401'
                    currentPage = Object.values(this.routes).find(elt => `#${elt.slug}` === '#401')
                    showPage.bind( this )( )
                }
            } else {

                showPage.bind( this )( )

            }


        }

        async function showPage(  ) {

            if( !this.cache.hasOwnProperty( route ) ) {

                let res = await fetch( currentPage.fileName )
                this.cache[route] = await res.text()

            }

            let newRoute = route.replace( '#', '/' )

            history.replaceState( this.cache[route], null, newRoute )

            document.getElementById( 'content' ).innerHTML = this.cache[route]

            document.querySelector('title').innerHTML = currentPage.title

            document.dispatchEvent( pageReady )

        }
    }
}

let routes = { };


( ( ) => { fetch( '/api/get?name=pages' )

    .then( res => { return res.json( ) } )

    .then( data => {

        let folder = '../views/pages/'

        data.forEach( e => {
            let newPage = {
                'slug': e.slug,
                'fileName': folder + e.fileName + '.html',
                'title': e.title,
                'access': e.access,
            }
            routeList.push( newPage )
        })

        Object.assign( routes, routeList )

    } )

} )( )

let pagesRoutes = new Router( routes );

window.onpopstate = e => {

    document.getElementById( 'content' ).innerHTML = pagesRoutes.cache[ document.location.pathname.replace( '/', '#' ) ]
    document.dispatchEvent( pageReady )

}
( ( ) => { fetch( '/api/get?name=products' )

    .then( res => { return res.json( ) } )

    .then( data => {

        let folder = '../views/templates/'

        data.forEach( e => {
            let newPage = {
                'slug': e.slug,
                'fileName': folder + 'product.html',
                'title': e.name,
                'access': e.access,
            }
            routeList.push( newPage )
        })

        Object.assign( routes, routeList )

        document.dispatchEvent( dbReady )
    } )

} )( )


window.addEventListener( 'pageReady', e => buildProduct( ) )

function buildProduct( ){

    let target = location.pathname.split( '/' ).pop( )
    let productList = localStorage.getItem( 'products' )

    JSON.parse( productList ).forEach( elt => {

        if( elt.slug === target ){

            document.querySelector( 'h1' ).innerHTML = elt.name
            document.getElementById( 'ref' ).innerHTML = elt.ref
            document.getElementById( 'price' ).innerHTML = elt.price

        }

    })

    document.dispatchEvent( initWebsite )
}
let userMenuHTML,
    loginLogoutFormHTML,
    cartHTML,
    cartRowHTML

fetch( '../views/parts/navbar.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => document.getElementById( 'navbar' ).innerHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/footer.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => document.getElementById( 'footer' ).innerHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/pushNotification.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => document.getElementById( 'pushNotification' ).innerHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/userMenu.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => userMenuHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/loginLogoutForm.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => loginLogoutFormHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/cart.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => cartHTML = data )
    .catch( error => console.error( error ) )

fetch( '../views/parts/cartRow.html', { mode: 'no-cors' } )
    .then( response => response.text( ) )
    .then( data => cartRowHTML = data )
    .catch( error => console.error( error ) )

document.addEventListener( 'initWebsite', function( ) {
    const pushNotif = document.getElementById( 'pushNotification' )
    const notice = pushNotif.firstElementChild
    const clodeBtn = notice.lastElementChild

    clodeBtn.addEventListener( 'click', e => {
        notice.classList.toggle( 'show' )
        notice.classList.toggle( 'hide' )
    })

})

function showPushNotification( type, msg ){

    const pushNotif = document.getElementById( 'pushNotification' )
    const notice = pushNotif.firstElementChild

    notice.classList.remove( 'show' )
    notice.classList.add( 'hide' )
    notice.classList.remove( 'info' )
    notice.classList.remove( 'success' )
    notice.classList.remove( 'error' )

    switch ( type ) {
        case 'success':
            notice.classList.add( 'success' )
            break
        case 'error':
            notice.classList.add( 'error' )
            break
        case 'info':
            notice.classList.add( 'info' )
            break
    }

    notice.querySelector( '.msg' ).innerText = ''
    notice.querySelector( '.msg' ).innerText = msg

    notice.classList.toggle( 'hide' )
    notice.classList.toggle( 'show' )

    setTimeout( function( ) {
        if ( notice.classList.contains( 'show' ) ) {
            notice.classList.toggle( 'show' )
            notice.classList.toggle( 'hide' )
        }
    }, 5000 )

}
document.body.addEventListener( 'click', e => {
    e.target.dataset.modaltarget != null ? showModal( e.target.dataset.modaltarget ) : e.target.closest( '.modal' ) === null ? hideModal() : null
} )

function showModal( e ){
    document.querySelectorAll( `[data-modal]` ).forEach( elt => elt.hidden = true )
    document.querySelector( `[data-modal=${e}]` ).hidden = false
}

function hideModal( ){
    document.querySelectorAll( `[data-modal]` ).forEach( elt => elt.hidden = true )
}
let cartLocal

document.addEventListener( 'initWebsite', ( ) => {

    document.getElementById( 'addCart' ) ? document.getElementById( 'addCart' ).addEventListener( 'click', e => addCart( e.target ) ) : null
    document.getElementById( 'cartModal' ).innerHTML = cartHTML
    refreshCart( )

} )

document.body.addEventListener( 'click', e => {

    e.target.closest( '.removeCart' ) ? removeCart( e.target.closest( '.removeCart' ).parentElement.parentElement.querySelector( '.refLabel > .value' ).innerHTML ): null

} )


function refreshCart( ) {

    cartLocal = localStorage.getItem( 'cartLocal' ) ? localStorage.getItem( 'cartLocal' ) : cartLocal = null

    const buttonCart = document.getElementById( 'buttonCart' )
    const tbody = document.getElementById( 'cart' ).getElementsByTagName( 'tbody' )[0]
    tbody.innerHTML = ''
    let totalPrice = 0
    buttonCart.classList.add( 'tooltip' )
    buttonCart.classList.remove( 'buttonModal' )
    buttonCart.removeAttribute('data-modaltarget')

    if ( cartLocal != null ) {

        buttonCart.classList.remove( 'tooltip' )
        buttonCart.classList.add( 'buttonModal' )
        buttonCart.dataset.modaltarget = 'cart'

        JSON.parse( cartLocal ).forEach( e => {

            tbody.innerHTML += cartRowHTML
            tbody.lastElementChild.querySelector( '.refLabel > .value' ).innerHTML = e.ref
            tbody.lastElementChild.querySelector( '.productLabel > .value' ).innerHTML = e.name
            tbody.lastElementChild.querySelector( '.priceLabel > .value' ).innerHTML = e.price
            tbody.lastElementChild.querySelector( '.qtyLabel > .value' ).innerHTML = e.qty
            tbody.lastElementChild.querySelector( '.totalLabel > .value' ).innerHTML = e.price * e.qty
            totalPrice += e.price * e.qty

        })

        tbody.nextElementSibling.lastElementChild.querySelector( '.value' ).innerHTML = totalPrice


    } else {



    }

}

function addCart( e ) {

    const productElem = e.closest( '.productElem' )
    let productAdd = { }
    let data = [ ]

    productAdd = {
            "ref"   : productElem.children[ 'ref' ].innerHTML,
            "name"  : productElem.children[ 'name' ].innerHTML,
            "price" : parseFloat( productElem.children[ 'price' ].innerHTML ),
            "qty"   : parseFloat( productElem.children[ 'qty' ].children[ 'qtyInput' ].value )
        }


    if ( !cartLocal ){

        data.push( productAdd )
        localStorage.setItem( 'cartLocal', JSON.stringify( data ) )
        refreshCart( )

    } else {

        data = JSON.parse( localStorage.getItem( 'cartLocal' ) )
        let newItem = true

        data.forEach( e => productAdd.ref === e.ref ? ( e.qty += productAdd.qty, newItem = false ) : null )
        newItem ? ( data.push( productAdd ), localStorage.setItem( 'cartLocal', JSON.stringify( data ) ) ) : localStorage.setItem( 'cartLocal', JSON.stringify( data ) )
        refreshCart( )

    }

}

function removeCart( ref ) {

    let newData = [ ]
    JSON.parse( cartLocal ).forEach( e => e.ref === ref ? null : newData.push( e ) )
    newData.length <= 0 ? ( localStorage.removeItem( 'cartLocal' ), refreshCart( ), hideModal( ) ) : ( localStorage.setItem( 'cartLocal', JSON.stringify( newData ) ), refreshCart( ) )

}

document.addEventListener( 'initWebsite', function() {



    let userLocal = localStorage.getItem( 'userLocal' )

    if ( userLocal ) {

        userIsLog( )

    } else {

        document.getElementById( 'loginRegister' ).innerHTML = loginLogoutFormHTML

        const loginForm = document.getElementById( 'loginRegisterForm' )
        const switchForm = document.getElementById( 'switchForm' )
        const buttonSubmit = document.getElementById( 'buttonSend' )

        switchForm.addEventListener( 'click', ( e ) => {
            e.preventDefault( )

            buttonSubmit.classList.contains( 'loginSubmit' ) ? switchToRegister( ) : switchToLogin( )

            function switchToLogin( ) {
                switchForm.innerHTML = "Pas encore enregistré"
                loginForm.querySelector( 'legend' ).innerHTML = "S'identifier"
                loginForm.confirmPassword.hidden = true
                buttonSubmit.value = "Connexion"
                buttonSubmit.classList.toggle( 'loginSubmit' )
            }

            function switchToRegister( ) {
                switchForm.innerHTML = "J'ai déjà un compte"
                loginForm.querySelector( 'legend' ).innerHTML = "S'enregistrer"
                loginForm.confirmPassword.hidden = false
                buttonSubmit.value = "Inscription"
                buttonSubmit.classList.toggle( 'loginSubmit' )
            }
        })

        if ( loginForm ){

            loginForm.addEventListener( 'submit', async( e ) => {

                e.preventDefault( )
                let param = '?'

                if( e.target.monprenom.value === '' & e.target.monadresse.value === 'ceci est mon adresse' ) {
                    let data = new FormData(e.target)

                    if ( buttonSubmit.classList.contains( 'loginSubmit' ) ) {
                        for ( var [key, value] of data.entries( ) ) {
                            param = param.concat( `${key}=${value}&` )
                        }

                        param = param.slice( 0, -1 )

                        fetch( `/api/login${param}` )
                            .then( res => {
                                return res.json( )
                            })
                            .then( data => {
                                if ( data === 'user not found' ) {
                                    showPushNotification( 'error', "Email incorrect" )
                                } else if ( data === 'incorrect password' ) {
                                    showPushNotification( 'error', "Mauvais mot de passe" )
                                } else {
                                    localStorage.setItem( 'userLocal', data )
                                    showPushNotification( 'success', "Connexion réussi !" )
                                    hideModal( )
                                    userIsLog( )
                                }
                            })
                    } else {

                        let dataSend = { }

                        for ( var [key, value] of data.entries( ) ) {
                            dataSend[key] = value
                            param = param.concat( `${key}=${value}&` )
                        }

                        const regexPatPwd = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9!@#$%^&*()_+\-=]*.{8,25}$/
                        const pwdCheck = regexPatPwd.test( dataSend.password )
                        pwdCheck ? null : showPushNotification( 'error', "Le mot de passe doit contenir 8 à 25 caractères et au moins 1 majuscule, 1 minuscule et 1 chiffre." )

                        if ( pwdCheck && dataSend.password === dataSend.confirmPassword ){
                            param = param.slice( 0, -1 )

                            fetch( `/api/register${param}` )
                                .then( res => {
                                    return res.json( )
                                }).then( data => {
                                    if ( data === 'email already use' ){
                                        showPushNotification( 'error', "Adresse email déjà utilisée" )
                                    } else {
                                        showPushNotification( 'success', "Compte créé, vous pouvez vous connecter" )
                                        hideModal( )
                                    }
                            })
                        }
                    }
                }
            })
        }
    }

})

function userIsLog( ) {

    document.getElementById( 'loginRegister' ).innerHTML = userMenuHTML
    document.getElementById( 'logoutMenu' ).addEventListener( 'click', e => {
        e.preventDefault( )
        localStorage.removeItem( 'userLocal' )
        userIsNotLog( )
        showPushNotification( 'success', "Déconnection réussi !" )
    })

}

function userIsNotLog( ) {

    document.getElementById( 'loginRegister' ).innerHTML = loginLogoutFormHTML


}