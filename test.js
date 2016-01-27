var webpage   = 'http://cebu.mynimo.com';

casper.test.begin( 'Mynimo - browser test', function ( test ) {
	casper.start( webpage );

	casper.then( function () {
		test.assertTitle( 'Mynimo | Cebu Jobs - Super Simple Job Search in Cebu', 'should match to the given title' );
	} );

	casper.then( function () {
		test.assertExists( 'div.jobs_table table.zebra tr.aJob', 'should have results' );
	} );

	casper.then( function () {
		test.assertExists( '#categoryBox > div > div > ul > li', 'should have categories' );
	} );

	casper.run( function () {
		var self = this;

		test.done();

		// to avoid warning error due to incompatibility to new phantomjs
		setTimeout( function () {
			self.exit();
		}, 0 );
	} );
} );