var casper = require( 'casper' ).create( {
	'verbose' : true,
	'logLevel' : 'debug',
	'pageSettings' : {
        'userAgent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34'
    }
} );

var fs = require( 'fs' );

var webpage   = 'http://cebu.mynimo.com';
var finalJobsData = [];


casper.start( webpage );

// get initial data
casper.then( function () {
	this.emit( 'data.get' );
} );

// paginate and get data
casper.then( function () {
	this.emit( 'data.paginate' );
} );

casper.run( function () {
	var self = this;

	// put the aggregated data to a file
	fs.write( 'mynimo.json', JSON.stringify( finalJobsData ), 'w' );

	self.page.close();

	// to avoid warning error due to incompatibility to new phantomjs
	setTimeout( function () {
		self.exit();
	}, 0 );
} );

casper.on( 'data.get', function () {
	// wait for the container to load
	// iterate and get the data
	casper.waitForSelector( 'div.jobs_table', function() {
		var data = this.evaluate( function ( webLink ) {
			var jobsData = [ ];
			var listings = document.querySelectorAll( 'div.jobs_table table.zebra tr.aJob' );

			[ ].forEach.call( listings, function( row ) {
				var info = { };
				[ ].forEach.call( row.children, function ( col, index ) {
			    	switch( index ) {
			        	case 0:
				          	info[ 'job_title' ]  = col.querySelector( 'div.job-title>a.jobTitleLink' ).innerText.trim() || '';
							info[ 'job_link' ]   = webLink + col.querySelector( 'div.job-title>a.jobTitleLink' ).getAttribute( 'href' );
							info[ 'job_salary' ] = col.querySelector( 'div.job-title>span.salary-footnote' ).innerText.trim() || 'Around Expected Salary';
			       		break;
			          	case 1:
							var address  = col.innerText.trim().split( '\n' );

							info[ 'company_adress' ] =  ( address[ 1 ] ) ? address[ 1 ] + ',' + address[ 0 ] : address[ 0 ];
			        	break;
			          	case 2:
			          		info[ 'company_name' ] = col.innerText.trim();
			          	break;
			          	case 3:
			          		info[ 'date_posted' ] = col.innerText.trim();
			          	break;
			        }
			    } );

	    		jobsData.push( info );
			} );

			return jobsData;
		},  webpage );

		finalJobsData.push.apply( finalJobsData, data );
	} );
} );

casper.on( 'data.paginate', function () {
	// click next page and load another page
	this.click( '#content > div:nth-child(2) > div > ul.paginator > li.next > a' );

	// wait for the element again to be available in dom
	this.waitForSelector( '#content > div:nth-child(2) > div > ul.paginator', function () {
		// get data
		this.emit( 'data.get' );
		// wait for 5s then paginate again
		this.wait( 5000, function () {
			this.emit( 'data.paginate' );
		} );
	}, function () {
		// timeout
		this.echo( "pagination failed. Sorry.").exit();
	}, 5000 );
} );

casper.on( 'error', function( msg,backtrace ) {
  this.echo( 'Error:' );
  this.echo( msg );
  this.echo( backtrace );
} );

casper.on( 'page.error', function( msg, backtrace ) {
  this.echo( 'Page error:' );
  this.echo( msg );
  this.echo( backtrace );
} );


