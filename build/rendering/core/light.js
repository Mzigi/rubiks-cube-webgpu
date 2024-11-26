import { Vector3 } from "./model.js";
export var LightType;
(function (LightType) {
    LightType[LightType["Virtual"] = 0] = "Virtual";
    LightType[LightType["Point"] = 1] = "Point";
    LightType[LightType["Spot"] = 2] = "Spot";
})(LightType || (LightType = {}));
export class Light {
    static lightType = LightType.Virtual;
    id;
    position = new Vector3(0, 0, 0);
    distance = 10;
    diffuseColor = new Vector3(255, 255, 255);
    specularColor = new Vector3(255, 255, 255);
    _constant;
    _linear;
    _quadratic;
    get static() {
        return this.constructor;
    }
    get constant() {
        if (this._constant) {
            return this._constant;
        }
        return 1;
    }
    set constant(val) {
        this._constant = val;
    }
    get linear() {
        if (this._linear) {
            return this._linear;
        }
        return 4.6905 * Math.pow(this.distance, -1.0097);
    }
    set linear(val) {
        this._linear = val;
    }
    get quadratic() {
        if (this._quadratic) {
            return this._quadratic;
        }
        return 82.448 * Math.pow(this.distance, -2.0192);
    }
    set quadratic(val) {
        this._quadratic = val;
    }
}
/*

Distance	Constant	Linear	Quadratic
  7	          1.0	     0.7	  1.8
  13          1.0	     0.35	  0.44
  20          1.0	     0.22	  0.20
  32          1.0	     0.14	  0.07
  50          1.0	     0.09	  0.032
  65          1.0	     0.07	  0.017
  100         1.0	     0.045	  0.0075
  160         1.0	     0.027	  0.0028
  200         1.0	     0.022	  0.0019
  325         1.0	     0.014	  0.0007
  600         1.0	     0.007	  0.0002
  3250	      1.0	     0.0014	  0.000007

*/
// x = Distance
// Linear(x) := 4.6905x^-1.0097
// Quadratic(x) := 82.448x^-2.0192
export class PointLight extends Light {
    static lightType = LightType.Point;
}
//# sourceMappingURL=light.js.map