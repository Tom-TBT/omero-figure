
//
// Copyright (C) 2016 University of Dundee & Open Microscopy Environment.
// All rights reserved.
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as
// published by the Free Software Foundation, either version 3 of the
// License, or (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
//

import Backbone from "backbone";
import $ from "jquery";
import _ from 'underscore';
import * as bootstrap from "bootstrap"

import lut_picker_template from '../../templates/lut_picker.template.html?raw';
import { showModal } from "./util";

import lutsPng from "../../images/luts_10.png";
// Need to handle dev vv built (omero-web) paths
const lutsPngUrl = STATIC_DIR + lutsPng;

// Should only ever have a singleton on this
var LutPickerView = Backbone.View.extend({

    el: $("#lutpickerModal"),

    template: _.template(lut_picker_template),

    LUT_NAMES: ["16_colors.lut",
                "3-3-2_rgb.lut",
                "5_ramps.lut",
                "6_shades.lut",
                "blue_orange_icb.lut",
                "brgbcmyw.lut",
                "cividis.lut",
                "cool.lut",
                "cyan_hot.lut",
                "edges.lut",
                "fire.lut",
                "gem.lut",
                "glasbey.lut",
                "glasbey_inverted.lut",
                "glow.lut",
                "grays.lut",
                "green_fire_blue.lut",
                "hilo.lut",
                "ica.lut",
                "ica2.lut",
                "ica3.lut",
                "ice.lut",
                "inferno.lut",
                "magenta_hot.lut",
                "magma.lut",
                "orange_hot.lut",
                "phase.lut",
                "physics.lut",
                "plasma.lut",
                "pup_br.lut",
                "pup_nr.lut",
                "rainbow_rgb.lut",
                "red-green.lut",
                "red_hot.lut",
                "royal.lut",
                "sepia.lut",
                "smart.lut",
                "spectrum.lut",
                "thal.lut",
                "thallium.lut",
                "thermal.lut",
                "unionjack.lut",
                "viridis.lut",
                "yellow_hot.lut"],

    initialize:function () {
        this.lutModal = new bootstrap.Modal('#lutpickerModal');
    },

    
    events: {
        "click button[type='submit']": "handleSubmit",
        "click .lutOption": "pickLut",
    },

    handleSubmit: function() {
        this.success(this.pickedLut);
        this.lutModal.hide();
    },

    pickLut: function(event) {
        var lutName = event.currentTarget.getAttribute('data-lut');
        // Save the name - used in handleSubmit();
        this.pickedLut = lutName;

        // Update preview to show LUT
        var bgPos = this.getLutBackgroundPosition(lutName);
        $(".lutPreview", this.el).css({'background-position': bgPos, 'background-image': `url(${lutsPngUrl})`});
        // Enable OK button
        $("button[type='submit']", this.el).removeAttr('disabled');
    },

    loadLuts: function() {
        var url = WEBGATEWAYINDEX + 'luts/';
        let cors_headers = { mode: 'cors', credentials: 'include' };
        return fetch(url, cors_headers).then(rsp => rsp.json());
    },

    getLutBackgroundPosition: function(lutName) {
        var lutIndex = this.LUT_NAMES.indexOf(lutName);
        if (lutIndex > -1) {
            return '0px -' + ((lutIndex * 50) +2) + 'px';
        } else {
            return '0px 100px';  // hides background
        }
    },

    formatLutName: function(lutName) {
        lutName = lutName.replace(".lut", "");
        lutName = lutName.replace(/_/g, " ");
        // Title case
        lutName = lutName[0].toUpperCase() + lutName.slice(1);
        return lutName;
    },

    show: function(options) {

        showModal("lutpickerModal");

        // save callback to use on submit
        if (options.success) {
            this.success = options.success;
        }

        this.loadLuts().then((data) => {
            console.log('data', data);
            this.luts = data.luts;
            this.render();
        });
    },

    render:function() {
        
        var html = "",
            luts;
        if (!this.luts) {
            html = "<p>Loading Lookup Tables failed.</p>";
            html += "<p>Your OMERO version does not support LUTs. Please upgrade.</p>";
        } else {
            luts = this.luts.map(function(lut) {
                // Add css background-position to each lut to offset luts_10.png
                return {'bgPos': this.getLutBackgroundPosition(lut.name),
                        'name': lut.name,
                        'displayName': this.formatLutName(lut.name)};
            }.bind(this));
            html = this.template({'luts': luts, lutsPngUrl});
        }
        $(".modal-body", this.el).html(html);
    }
});

const FigureLutPicker = new LutPickerView();

export default FigureLutPicker
