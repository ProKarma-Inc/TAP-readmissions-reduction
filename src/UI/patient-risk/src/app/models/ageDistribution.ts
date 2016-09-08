/**
 * Created by prokarma on 8/30/2016.
 */
export class AgeDistribution{
  private ageGroupRange: number = 5;
  public allAges: Array<number> = [];

  public generateAgeBuckets(): Array<Array<number>>{
    let buckets: Array<Array<number>> = [];

    let sortedAges = this.allAges.sort(sortAsc);
    let currentLower = this.lowerLimit();
    let currentUpper = (currentLower + this.ageGroupRange);

    for(let i = 0; i < this.numberOfColumns(); i++){
      buckets.push(sortedAges.filter(age => age >= currentLower && age <= currentUpper));
      currentLower = currentUpper;
      currentUpper = (currentLower + this.ageGroupRange);
    }
    return buckets;
  }

  public generateColumns(): Array<string>{
    let labels: Array<string> = [];

    let currentLower = this.lowerLimit();
    console.log(currentLower);
    for(let i = 0; i < this.numberOfColumns(); i++){
        let newLower = (currentLower + this.ageGroupRange);
        let label = currentLower + ' - ' + newLower;
        labels.push(label);
        currentLower = newLower;
    }
    return labels;
  }

  private numberOfColumns(): number{
    let upper = this.upperLimit();
    let lower = this.lowerLimit();
    return ((upper - lower) / this.ageGroupRange);
  }

  private upperLimit(): number{
    return Math.max.apply(Math, this.allAges);
  }

  private lowerLimit(): number{
    return Math.min.apply(Math, this.allAges);
  }
}

function sortAsc(lhs, rhs){
  return lhs - rhs;
}
