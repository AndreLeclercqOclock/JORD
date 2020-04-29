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