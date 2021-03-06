var mapnik = require('mapnik');
var assert = require('assert');
var fs = require('fs');

var stylesheet = './examples/stylesheet.xml';
var reference = fs.readFileSync('./test/support/grid2.json', 'utf8');
var reference_view = fs.readFileSync('./test/support/grid_view.json', 'utf8');

describe('mapnik grid rendering ', function() {

    it('should match expected output (sync rendering)', function(done) {
        var map = new mapnik.Map(256, 256);
        map.loadSync(stylesheet, {strict: true});
        map.zoomAll();
        var grid = new mapnik.Grid(map.width, map.height, {key: '__id__'});
        var options = {'layer': 0,
                       'fields': ['NAME']
                      };
        map.render(grid, options, function(err, grid) {
            var grid_utf = grid.encodeSync('utf', {resolution: 4});
            //fs.writeFileSync('./ref.json',JSON.stringify(grid_utf))
            assert.equal(JSON.stringify(grid_utf), reference);
            // pull an identical view and compare it to original grid
            var gv = grid.view(0, 0, 256, 256);
            var gv_utf = gv.encodeSync('utf', {resolution: 4});
            assert.equal(JSON.stringify(gv_utf), reference);
            // pull a subsetted view (greenland basically)
            var gv2 = grid.view(64, 64, 64, 64);
            assert.equal(gv2.width(), 64);
            assert.equal(gv2.height(), 64);
            var gv_utf2 = gv2.encodeSync('utf', {resolution: 4});
            //fs.writeFileSync('./test/support/grid_view.json',JSON.stringify(gv_utf2),'utf8')
            assert.equal(JSON.stringify(gv_utf2), reference_view);
            done();
        });
    });

    it('should match expected output (async rendering)', function(done) {
        var map = new mapnik.Map(256, 256);
        map.load(stylesheet, {strict: true}, function(err,map) {
            if (err) throw err;
            map.zoomAll();
            var grid = new mapnik.Grid(map.width, map.height, {key: '__id__'});

            var options = {'layer': 0,
                           'fields': ['NAME']
                          };
            map.render(grid, options, function(err, grid) {
                assert.ok(!err);
                grid.encode('utf', {resolution: 4}, function(err,utf) {
                    assert.equal(JSON.stringify(utf), reference);
                    done();
                });
            });
        });
    });

    it('should match expected output (async rendering view)', function(done) {
        var map = new mapnik.Map(256, 256);
        map.load(stylesheet, {strict: true}, function(err,map) {
            if (err) throw err;
            map.zoomAll();
            var grid = new mapnik.Grid(map.width, map.height, {key: '__id__'});

            var options = {'layer': 0,
                           'fields': ['NAME']
                          };
            map.render(grid, options, function(err, grid) {
                assert.ok(!err);
                var gv = grid.view(0, 0, 256, 256);
                gv.encode('utf', {resolution: 4}, function(err,gv_utf1) {
                    assert.equal(JSON.stringify(gv_utf1), reference);
                    done();
                });
            });
        });
    });

    it('should match expected output (async rendering view subsetted)', function(done) {
        var map = new mapnik.Map(256, 256);
        map.load(stylesheet, {strict: true}, function(err,map) {
            if (err) throw err;
            map.zoomAll();
            var grid = new mapnik.Grid(map.width, map.height, {key: '__id__'});

            var options = {'layer': 0,
                           'fields': ['NAME']
                          };
            map.render(grid, options, function(err, grid) {
                assert.ok(!err);
                // pull a subsetted view (greenland basically)
                var gv2 = grid.view(64, 64, 64, 64);
                assert.equal(gv2.width(), 64);
                assert.equal(gv2.height(), 64);
                gv2.encode('utf', {resolution: 4}, function(err,gv_utf2) {
                    assert.equal(JSON.stringify(gv_utf2), reference_view);
                    done();
                });
            });
        });
    });

});
